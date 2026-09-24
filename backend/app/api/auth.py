from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token, security_bearer
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token, ProfileUpdate, PasswordUpdate
from app.services.audit_service import audit_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(token_auth = Depends(security_bearer), db: Session = Depends(get_db)) -> User:
    if not token_auth:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_access_token(token_auth.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user

def get_current_organizer_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["organizer", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Organizer or Admin access required")
    return current_user

def get_current_volunteer_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["volunteer", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Volunteer check-in access required")
    return current_user

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    # Public registration only permits 'donor' or 'organizer' roles
    requested_role = user_in.role.lower() if user_in.role else "donor"
    if requested_role not in ["donor", "organizer"]:
        requested_role = "donor"
        
    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=requested_role,
        phone=user_in.phone,
        telegram_chat_id=user_in.telegram_chat_id,
        preferred_language=user_in.preferred_language or "en",
        previous_donations_count=user_in.previous_donations_count or 0
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    audit_service.log_event(
        db=db,
        action="user.registered",
        entity_type="user",
        entity_id=user.id,
        actor_id=user.id,
        actor_role=user.role,
        before_state=None,
        after_state={"email": user.email, "role": user.role, "full_name": user.full_name}
    )

    access_token = create_access_token(data={"sub": user.id, "role": user.role, "email": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": user.id, "role": user.role, "email": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    before_state = {
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "telegram_chat_id": current_user.telegram_chat_id,
        "preferred_language": current_user.preferred_language,
        "previous_donations_count": current_user.previous_donations_count
    }

    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone
    if profile_in.telegram_chat_id is not None:
        current_user.telegram_chat_id = profile_in.telegram_chat_id
    if profile_in.preferred_language is not None:
        current_user.preferred_language = profile_in.preferred_language
    if profile_in.previous_donations_count is not None:
        current_user.previous_donations_count = profile_in.previous_donations_count

    db.commit()
    db.refresh(current_user)

    audit_service.log_event(
        db=db,
        action="user.profile_updated",
        entity_type="user",
        entity_id=current_user.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        before_state=before_state,
        after_state={
            "full_name": current_user.full_name,
            "phone": current_user.phone,
            "telegram_chat_id": current_user.telegram_chat_id,
            "preferred_language": current_user.preferred_language,
            "previous_donations_count": current_user.previous_donations_count
        }
    )

    return current_user

@router.post("/update-password")
def update_password(
    pwd_in: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    if len(pwd_in.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long")

    current_user.hashed_password = get_password_hash(pwd_in.new_password)
    db.commit()

    audit_service.log_event(
        db=db,
        action="user.password_changed",
        entity_type="user",
        entity_id=current_user.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        before_state=None,
        after_state={"status": "password_changed"}
    )

    return {"message": "Password updated successfully"}
