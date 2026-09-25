import httpx
import json
import logging
from typing import Optional, Dict, Any, List
from app.core.config import settings
from app.models.models import User, Campaign

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.model = settings.OLLAMA_MODEL

    async def _query_ollama(self, prompt: str, system_prompt: Optional[str] = None) -> Optional[str]:
        """
        Send prompt to local Ollama instance with timeout. Returns None if Ollama is unreachable.
        """
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                payload = {
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                }
                if system_prompt:
                    payload["system"] = system_prompt
                    
                response = await client.post(f"{self.base_url}/api/generate", json=payload)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("response", "").strip()
        except Exception as e:
            logger.info(f"Ollama local instance unavailable ({e}), using resilient template fallback.")
            return None
        return None

    async def generate_message(
        self,
        donor: User,
        campaign: Campaign,
        communication_stage: str,
        time_remaining: str,
        previous_response: str,
        confirmation_status: str,
        slot_time: str = "General Slot",
        preferred_language: str = "en"
    ) -> Dict[str, str]:
        """
        Generate warm, trustworthy donor mobilization message.
        Falls back to high-fidelity predefined templates if Ollama is unavailable.
        """
        system_instruction = (
            "You are the Life Share AI Mobilisation Assistant for blood donation drives. "
            "Your tone is warm, respectful, concise, and trustworthy. "
            "NEVER provide medical advice or clinical screening questions. "
            "Focus only on slot confirmation, venue logistics, and encouraging attendance."
        )
        
        donor_name = donor.full_name if donor else "Valued Donor"
        campaign_name = campaign.name if campaign else "Blood Donation Drive"
        venue = campaign.venue if campaign else "Designated Venue"
        drive_date = campaign.drive_date if campaign else "Upcoming Date"
        
        prompt = (
            f"Generate a concise Telegram message (max 3 sentences) in {preferred_language} for:\n"
            f"Stage: {communication_stage}\n"
            f"Donor: {donor_name}\n"
            f"Campaign: {campaign_name}\n"
            f"Time Remaining: {time_remaining}\n"
            f"Previous Response: {previous_response}\n"
            f"Status: {confirmation_status}\n"
            f"Slot Time: {slot_time}\n"
            f"Date/Venue: {drive_date} at {venue}\n"
        )
        
        ai_response = await self._query_ollama(prompt, system_instruction)
        if ai_response:
            return {"content": ai_response, "generated_by": "ollama_qwen"}

        # Resilient Predefined Templates
        templates = {
            "registration_confirmation": (
                f"Hi {donor_name}, your interest for the {campaign_name} is registered! "
                f"Your selected slot is {slot_time} on {drive_date} at {venue}. "
                f"Please confirm your attendance in Life Share."
            ),
            "slot_confirmation": (
                f"Hi {donor_name}, your slot for {campaign_name} is CONFIRMED for {slot_time} on {drive_date} at {venue}. "
                f"Your digital check-in pass is ready in your Life Share dashboard. Every donor counts!"
            ),
            "t_minus_3_reminder": (
                f"Hello {donor_name}, reminder: {campaign_name} is in 3 days on {drive_date} ({slot_time}) at {venue}. "
                f"If your plans have changed, please update your slot so waitlisted donors can be notified."
            ),
            "t_minus_1_reminder": (
                f"Hi {donor_name}, tomorrow is the blood donation drive! We look forward to seeing you at {venue} at {slot_time}. "
                f"Keep your Life Share QR pass handy for seamless check-in."
            ),
            "cancellation_ack": (
                f"Hi {donor_name}, we've received your cancellation for {campaign_name}. "
                f"Your slot has been released to help another willing donor attend. Thank you for notifying us in advance!"
            ),
            "waitlist_promotion": (
                f"Good news {donor_name}! A slot has opened for {campaign_name} at {slot_time} on {drive_date} ({venue}). "
                f"Your registration has been moved from the waitlist to CONFIRMED! Your QR pass is now active."
            ),
            "thank_you": (
                f"Thank you {donor_name}! Your attendance at {campaign_name} has been verified. "
                f"Your contribution helps mobilise lifesaving blood for those in need."
            )
        }
        
        content = templates.get(communication_stage, f"Update regarding {campaign_name} for {donor_name}: Drive is on {drive_date} at {venue}.")
        return {"content": content, "generated_by": "template_fallback"}

    async def answer_organizer_query(
        self,
        prompt: str,
        campaign_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        AI Organizer Assistant answering questions regarding expected turnout, slot bottlenecks, waitlists, etc.
        """
        system_instruction = (
            "You are the Life Share AI Campaign Turnout Intelligence Assistant. "
            "You analyze campaign turnout metrics, slot occupancy, waitlist status, and attendance prediction. "
            "Provide concise, actionable insights strictly based on the provided campaign context. "
            "DO NOT invent data or give clinical advice. If data is not available, state that clearly."
        )
        
        context_str = json.dumps(campaign_context, indent=2)
        llm_prompt = f"Campaign Data Context:\n{context_str}\n\nOrganizer Question: {prompt}\nAnswer concisely and helpfully:"
        
        ai_reply = await self._query_ollama(llm_prompt, system_instruction)
        if ai_reply:
            return {"reply": ai_reply, "source": "ollama_qwen", "data_context": campaign_context}
            
        # Smart rule-based responses if Ollama is not active locally
        q_lower = prompt.lower()
        target = campaign_context.get("target_count", 100)
        predicted = campaign_context.get("predicted_attendance", 0)
        confirmed = campaign_context.get("confirmed_count", 0)
        registered = campaign_context.get("total_registered", 0)
        waitlisted = campaign_context.get("waitlisted_count", 0)
        gap = max(0, target - predicted)
        
        if "how many" in q_lower or "expected" in q_lower or "turnout" in q_lower or "predict" in q_lower:
            reply = (
                f"Based on current machine-learning prediction scores, we expect **{predicted} attendees** out of your {target} target "
                f"({confirmed} confirmed registrations + weighted probability of remaining {registered - confirmed} unconfirmed donors). "
                f"Expected turnout gap: **{gap} donors**."
            )
        elif "waitlist" in q_lower or "promotion" in q_lower or "fill" in q_lower:
            reply = (
                f"You currently have **{waitlisted} donors on the waitlist**. "
                f"The Dynamic Queue Engine will automatically promote the highest-probability waitlisted donors as soon as cancellations occur."
            )
        elif "cancell" in q_lower or "slot" in q_lower:
            reply = (
                f"Slot optimization is active. When a donor cancels, Life Share instantaneously frees the slot and promotes the next best waitlisted candidate, notifying them via Telegram."
            )
        elif "summar" in q_lower or "overview" in q_lower:
            reply = (
                f"**Campaign Summary**: Target is {target} donors. Currently {registered} registered ({confirmed} confirmed, {waitlisted} waitlisted). "
                f"ML model predicts {predicted} actual arrivals ({round((predicted/target)*100 if target else 0, 1)}% of target). Dynamic queue is actively monitoring capacity."
            )
        else:
            reply = (
                f"Campaign Status: {registered} total registrations, {confirmed} confirmed, {waitlisted} waitlisted. "
                f"Predicted actual turnout is {predicted} of target {target}. Let me know if you need specific slot analysis or waitlist breakdowns."
            )
            
        return {"reply": reply, "source": "rule_based_fallback", "data_context": campaign_context}

ollama_service = OllamaService()
