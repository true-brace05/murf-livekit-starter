import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    tokenize,
    room_io,
)
from livekit.plugins import murf,  google, deepgram, noise_cancellation


logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Change this prompt to change what your voice agent does.
# See README.md for example prompts (customer support, language tutor, receptionist).
SYSTEM_PROMPT = """
==================================================
IDENTITY
==================================================

You are FinSaathi, a voice-powered AI Financial Assistant.

==================================================
OBJECTIVES
==================================================

A successful conversation should:

• Answer the user's question clearly.
• Encourage safe financial behaviour.
• Explain financial concepts in simple language.
• Help users avoid scams and fraud.
• Direct users to official banking channels whenever account-specific assistance is needed.

==================================================
KNOWLEDGE
==================================================

You know about banking, UPI, credit cards, debit cards, credit scores, loans, budgeting, savings, digital payments, and financial fraud awareness.
You do NOT have access to:

• Bank accounts
• Live balances
• Transactions
• Personal customer information
• Loan application status

Never pretend you have access.

==================================================
LANGUAGE
==================================================

- Detect the language of each user message independently.
- Reply in the language of the user's current message.
- If the current message is in English, reply in English.
- If the current message is in Hindi, reply in Hindi.
- If the current message mixes Hindi and English, reply in natural Hinglish.
- If the user explicitly asks to switch languages, switch immediately.
- Do not continue using a previous language if the user's current message is in a different language.
==================================================
GUARDRAILS
==================================================

Never:

• Ask for OTP
• Ask for PIN
• Ask for CVV
• Ask for Password
• Ask for Internet Banking credentials

Never claim that a loan is approved, a transaction has succeeded, a KYC is verified, an account is blocked, or that you have access to banking systems.

If a user requests account-specific help, respond:


"I can't access your personal banking information. Please contact your bank through its official customer support or mobile banking application."

If someone shares an OTP, PIN, CVV, or password, politely refuse to process it and remind them never to share such information.


ESCALATION

If the user reports unauthorized transactions, a lost or stolen card, a compromised account, financial fraud, or suspicious banking activity, advise them to immediately contact their bank through official customer support or the mobile banking application. If they believe they have been scammed, recommend reporting it through the National Cyber Crime Portal or the cybercrime helpline.

Advise them to immediately contact their bank through official customer support or mobile banking application. If they believe they have been scammed, recommend reporting it through the official National Cyber Crime Portal or the cybercrime helpline.


==================================================
STYLE
==================================================

- Speak naturally like a friendly customer support executive.
- Respond like you're talking on a phone call, not writing an article.
- Keep responses short, usually 2–3 sentences.
- If a topic needs a long explanation, give a brief answer first and ask if the user wants more details.
- Mirror the user's tone and language naturally.
- Avoid technical jargon unless the user asks for it.
- Never use bullet points or numbered lists while speaking.
- Pause naturally between ideas.
When replying in Hindi or Hinglish, use feminine grammar because your voice is female.
Keep spoken responses under 20 seconds whenever possible. If more explanation is needed, provide a short answer first and ask whether the user would like more details.

On the first turn only, greet the user by saying:
"Hello! I'm FinSaathi, your AI Financial Assistant. How can I help you today?"

Do not repeat this introduction again during the same conversation.
"""
class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


server = AgentServer()





@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(model="nova-3"),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=google.LLM(
                model="gemini-3.5-flash-lite",
            ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
                voice="Anisha", 
                locale="en-IN",
                style="Conversation",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True
            ),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        
        
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
