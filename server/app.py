import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai
from flask_cors import CORS
from pymongo import MongoClient
import datetime
import time

load_dotenv()

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# --- Configuration ---
google_api_key = os.getenv("GEMINI_API_KEY")
mongo_uri = os.getenv("MONGODB_URI")

# --- Demo Mode Check ---
IS_DEMO_MODE = not google_api_key or google_api_key == "YOUR_GEMINI_API_KEY"

# --- Gemini AI Setup ---
if not IS_DEMO_MODE:
    genai.configure(api_key=google_api_key)

# --- MongoDB Setup ---
client = MongoClient(mongo_uri)
db = client.get_database("medical_scribe")
history_collection = db.get_collection("history")

DEMO_SOAP_NOTE = """
**S (Subjective):**
Patient is a 45-year-old male reporting a 3-day history of a sore throat, nasal congestion, and a mild, non-productive cough. He denies fever, chills, or body aches. Reports feeling fatigued. No known sick contacts.

**O (Objective):**
Vital Signs: Temp 98.9°F, BP 130/85, HR 80, RR 16, O2 Sat 99% on room air.
Physical Exam: Pharynx is erythematous with no exudates. Nasal mucosa is swollen and congested. Lungs are clear to auscultation bilaterally. Heart has a regular rate and rhythm.

**A (Assessment):**
1. Viral Upper Respiratory Infection (URI)
2. Allergic rhinitis

**P (Plan):**
1. Recommend supportive care: increased fluid intake, rest, and over-the-counter saline nasal spray.
2. Advised to take ibuprofen or acetaminophen for throat pain as needed.
3. Re-evaluate in 5-7 days if symptoms do not improve or worsen.
4. Patient educated on viral nature of illness and encouraged to monitor for signs of secondary bacterial infection.
"""

def seed_database():
    """Adds sample data to the history collection if it's empty."""
    if history_collection.count_documents({}) == 0:
        print("Database is empty. Seeding with sample data...")
        sample_notes = [
            {
                "patientId": "PID-001",
                "transcript": "Patient complains of a persistent headache for the last 48 hours, located in the frontal region. Describes the pain as a dull, constant ache. Rates pain at a 6/10. Denies any recent trauma.",
                "soapNote": "**S:** Patient is a 32-year-old female complaining of a persistent frontal headache for 48 hours, described as a dull, constant ache at 6/10 severity. Denies trauma.\n**O:** Vitals stable. Neurological exam is normal. No signs of photophobia or phonophobia.\n**A:** Tension headache.\n**P:** Recommended over-the-counter analgesics (ibuprofen 400mg). Advised to monitor symptoms and follow up if the headache worsens or is accompanied by other symptoms like fever or vision changes.",
                "timestamp": datetime.datetime.utcnow() - datetime.timedelta(days=1)
            },
            {
                "patientId": "PID-002",
                "transcript": "Follow-up visit for hypertension management. Patient reports good adherence to medication (Lisinopril 10mg). No side effects reported. Home blood pressure readings have been consistently around 135/85 mmHg.",
                "soapNote": "**S:** Follow-up for hypertension. Patient reports medication adherence and home BP readings of 135/85 mmHg.\n**O:** BP in-office is 138/88 mmHg. HR 72. No peripheral edema.\n**A:** Controlled hypertension.\n**P:** Continue current medication regimen. Encourage continued home BP monitoring. Follow up in 3 months. Discussed benefits of a low-sodium diet.",
                "timestamp": datetime.datetime.utcnow() - datetime.timedelta(hours=4)
            }
        ]
        history_collection.insert_many(sample_notes)
        print("Database seeded successfully.")

@app.route("/api/generate", methods=["POST"])
def generate_soap_note():
    """Receives a transcript and generates a SOAP note using the Gemini API or returns a demo note."""
    data = request.get_json()
    transcript = data.get("transcript")
    patient_id = data.get("patientId")

    if not transcript:
        return jsonify({"error": "Transcript is required"}), 400

    try:
        soap_note = ""
        if IS_DEMO_MODE:
            time.sleep(2)
            soap_note = DEMO_SOAP_NOTE
        else:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
            You are an expert medical scribe. Your task is to convert the following doctor-patient conversation into a structured SOAP note.

            **Transcript:**
            {transcript}

            **Output the SOAP note in the following format:**

            **S (Subjective):**
            [Patient's subjective complaints and history]

            **O (Objective):**
            [Objective findings from the physical exam, vital signs, and lab results]

            **A (Assessment):**
            [Your assessment of the patient's condition]

            **P (Plan):**
            [The plan for the patient's treatment and follow-up]
            """
            response = model.generate_content(prompt)
            soap_note = response.text

        history_collection.insert_one({
            "patientId": patient_id or "Demo Patient",
            "transcript": transcript,
            "soapNote": soap_note,
            "timestamp": datetime.datetime.utcnow()
        })

        confidence = 98

        return jsonify({"soapNote": soap_note, "confidence": confidence})

    except Exception as e:
        print(f"Error generating SOAP note: {e}")
        return jsonify({"error": "Failed to generate SOAP note"}), 500

@app.route("/api/history", methods=["GET"])
def get_history():
    """Retrieves all SOAP note history from the database."""
    try:
        history = list(history_collection.find().sort("timestamp", -1))
        for item in history:
            item["_id"] = str(item["_id"])
        return jsonify(history)
    except Exception as e:
        print(f"Error fetching history: {e}")
        return jsonify({"error": "Failed to fetch history"}), 500

if __name__ == "__main__":
    seed_database()
    app.run(port=3001, debug=True)
