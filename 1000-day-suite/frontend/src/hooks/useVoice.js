import { useState, useRef, useCallback } from 'react'

export const LANG_RESPONSES = {
  'en-IN': {
    greeting: 'Hello! I am your health assistant. How can I help you today?',
    vitals: 'Your blood pressure is 128 over 84, slightly elevated. Blood sugar 95, normal. Weight 62.4 kg. Risk score medium.',
    risk: 'Your current risk level is medium. Please drink plenty of water, rest well, and consult your doctor within 3 days.',
    doctor: 'Your next appointment with Doctor Priya Sharma is March 3rd at 11 AM. Video consultation.',
    medicine: 'Morning: folic acid and iron. Afternoon 2 PM: iron with water. Night: calcium 500mg.',
    diet: 'Breakfast: poha with peanuts and milk. Lunch: dal, spinach, roti, rice. Dinner: khichdi. Avoid salt today.',
    baby: 'Your baby is week 24, size of an ear of corn. WHO chart 54th percentile — very healthy!',
    hospital: 'AIIMS Hyderabad 3.2km, Fernandez 5.1km, Rainbow 6.4km. Emergency: call 108.',
    emergency: 'Emergency activated! Notifying husband and hospital. Stay calm. Help is coming. Call 108 now!',
    listening: 'Listening... Please speak now.',
    notHeard: 'Sorry, I did not understand. Please try again.',
    tapToSpeak: 'Tap the orb to speak'
  },
  'hi-IN': {
    greeting: 'नमस्ते! मैं आपकी स्वास्थ्य सहायक हूँ। आज मैं कैसे मदद करूं?',
    vitals: 'आपका BP 128/84, थोड़ा बढ़ा हुआ। शुगर 95 सामान्य। वजन 62.4 किलो।',
    risk: 'जोखिम मध्यम है। खूब पानी पियें, आराम करें, 3 दिन में डॉक्टर से मिलें।',
    doctor: 'डॉ. प्रिया शर्मा से अपॉइंटमेंट 3 मार्च सुबह 11 बजे।',
    medicine: 'सुबह: फोलिक एसिड और आयरन। दोपहर 2: आयरन। रात: कैल्शियम।',
    diet: 'सुबह पोहा और दूध। दोपहर दाल-पालक-रोटी। रात खिचड़ी। नमक कम खाएं।',
    baby: 'शिशु 24वें सप्ताह में, मक्के जितना। WHO 54वां प्रतिशत — बहुत स्वस्थ!',
    hospital: 'AIIMS हैदराबाद 3.2 किमी। एम्बुलेंस: 108।',
    emergency: 'आपातकाल! पति और अस्पताल को बताया जा रहा है। शांत रहें।',
    listening: 'सुन रही हूँ... बोलें।',
    notHeard: 'माफ़ करें, समझ नहीं आई। फिर कोशिश करें।',
    tapToSpeak: 'बोलने के लिए छुएं'
  },
  'te-IN': {
    greeting: 'నమస్కారం! నేను మీ ఆరోగ్య సహాయకుడను.',
    vitals: 'BP 128/84, కొద్దిగా ఎక్కువ. చక్కెర 95 సాధారణం. బరువు 62.4 కిలోలు.',
    risk: 'ప్రమాద స్థాయి మధ్యస్థం. నీళ్ళు తాగండి, విశ్రాంతి తీసుకోండి.',
    doctor: 'డాక్టర్ ప్రియా శర్మ - మార్చి 3, ఉదయం 11.',
    medicine: 'ఉదయం: ఫోలిక్ యాసిడ్. మధ్యాహ్నం: ఐరన్. రాత్రి: కాల్షియం.',
    diet: 'అల్పాహారం పోహా. భోజనం పప్పు-పాలకూర. రాత్రి కిచిడీ.',
    baby: 'శిశువు 24వ వారం. WHO 54వ శాతం - ఆరోగ్యకరం!',
    hospital: 'AIIMS 3.2 కి.మీ. అంబులెన్స్: 108.',
    emergency: 'అత్యవసరం! మీ భర్తకు తెలియజేస్తున్నారు.',
    listening: 'వింటున్నాను...',
    notHeard: 'క్షమించండి, మళ్ళీ చెప్పండి.',
    tapToSpeak: 'మాట్లాడటానికి నొక్కండి'
  },
  'ta-IN': {
    greeting: 'வணக்கம்! நான் உங்கள் உடல்நல உதவியாளர்.',
    vitals: 'BP 128/84, சற்று அதிகம். சர்க்கரை 95 சாதாரணம்.',
    risk: 'ஆபத்து நடுத்தரம். தண்ணீர் குடியுங்கள், ஓய்வெடுங்கள்.',
    doctor: 'டாக்டர் பிரியா - மார்ச் 3, காலை 11.',
    medicine: 'காலை: ஃபோலிக். மதியம்: இரும்பு. இரவு: கால்சியம்.',
    diet: 'காலை போஹா. மதியம் பருப்பு-கீரை. இரவு கிச்சடி.',
    baby: 'குழந்தை 24வது வாரம். WHO 54வது - ஆரோக்கியம்!',
    hospital: 'AIIMS 3.2 கி.மீ. ஆம்புலன்ஸ்: 108.',
    emergency: 'அவசரம்! உங்கள் கணவரை அழைக்கிறோம்.',
    listening: 'கேட்கிறேன்...',
    notHeard: 'புரியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    tapToSpeak: 'பேச தொடுங்கள்'
  },
  'bn-IN': {
    greeting: 'নমস্কার! আমি আপনার স্বাস্থ্য সহায়ক।',
    vitals: 'BP 128/84, একটু বেশি। সুগার 95 স্বাভাবিক।',
    risk: 'ঝুঁকি মাঝারি। জল খান, বিশ্রাম নিন।',
    doctor: 'ডাক্তার প্রিয়া - 3 মার্চ, সকাল 11।',
    medicine: 'সকাল: ফলিক। দুপুর: আয়রন। রাত: ক্যালসিয়াম।',
    diet: 'সকাল পোহা। দুপুর ডাল-পালং। রাত খিচুড়ি।',
    baby: 'শিশু 24 সপ্তাহ। WHO 54 - সুস্থ!',
    hospital: 'AIIMS 3.2 কিমি। অ্যাম্বুলেন্স: 108।',
    emergency: 'জরুরি! আপনার স্বামীকে ডাকছি।',
    listening: 'শুনছি...',
    notHeard: 'বুঝতে পারিনি। আবার বলুন।',
    tapToSpeak: 'কথা বলতে স্পর্শ করুন'
  },
  'mr-IN': {
    greeting: 'नमस्कार! मी तुमची आरोग्य सहाय्यक आहे.',
    vitals: 'BP 128/84, थोडे जास्त. साखर 95 सामान्य.',
    risk: 'धोका मध्यम आहे. पाणी प्या, विश्रांती घ्या.',
    doctor: 'डॉक्टर प्रिया - 3 मार्च, सकाळी 11.',
    medicine: 'सकाळ: फॉलिक. दुपार: लोह. रात्र: कॅल्शियम.',
    diet: 'सकाळ पोहा. दुपार डाळ-पालक. रात्र खिचडी.',
    baby: 'बाळ 24 आठवडे. WHO 54 - निरोगी!',
    hospital: 'AIIMS 3.2 किमी. रुग्णवाहिका: 108.',
    emergency: 'आणीबाणी! तुमच्या नवऱ्याला बोलावतोय.',
    listening: 'ऐकत आहे...',
    notHeard: 'समजले नाही. पुन्हा सांगा.',
    tapToSpeak: 'बोलण्यासाठी स्पर्श करा'
  },
  'gu-IN': {
    greeting: 'નમસ્તે! હું તમારી આરોગ્ય સહાયક છું.',
    vitals: 'BP 128/84, થોડું વધારે. સુગર 95 સામાન્ય.',
    risk: 'જોખમ મધ્યમ છે. પાણી પીવો, આરામ કરો.',
    doctor: 'ડોક્ટર પ્રિયા - 3 માર્ચ, સવારે 11.',
    medicine: 'સવાર: ફોલિક. બપોર: આયર્ન. રાત: કેલ્શિય.',
    diet: 'સવાર પોહા. બપોર દાળ-પાલક. રાત ખીચડી.',
    baby: 'બાળક 24 સપ્તાહ. WHO 54 - સ્વસ્થ!',
    hospital: 'AIIMS 3.2 કિમી. એમ્બ્યુલન્સ: 108.',
    emergency: 'કટોકટી! તમારા પતિને બોલાવીએ છીએ.',
    listening: 'સાંભળી રહી છું...',
    notHeard: 'સમજાયું નહીં. ફરીથી કહો.',
    tapToSpeak: 'બોલવા માટે સ્પર્શ કરો'
  },
  'kn-IN': {
    greeting: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ.',
    vitals: 'BP 128/84, ಸ್ವಲ್ಪ ಹೆಚ್ಚು. ಸಕ್ಕರೆ 95 ಸಾಮಾನ್ಯ.',
    risk: 'ಅಪಾಯ ಮಧ್ಯಮ. ನೀರು ಕುಡಿಯಿರಿ, ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ.',
    doctor: 'ಡಾಕ್ಟರ್ ಪ್ರಿಯಾ - ಮಾರ್ಚ್ 3, ಬೆಳಗ್ಗೆ 11.',
    medicine: 'ಬೆಳಗ್ಗೆ: ಫೋಲಿಕ್. ಮಧ್ಯಾಹ್ನ: ಕಬ್ಬಿಣ. ರಾತ್ರಿ: ಕ್ಯಾಲ್ಸಿಯಂ.',
    diet: 'ಬೆಳಗ್ಗೆ ಪೋಹಾ. ಮಧ್ಯಾಹ್ನ ಬೇಳೆ-ಪಾಲಕ್. ರಾತ್ರಿ ಕಿಚಡಿ.',
    baby: 'ಮಗು 24 ವಾರ. WHO 54 - ಆರೋಗ್ಯಕರ!',
    hospital: 'AIIMS 3.2 ಕಿಮೀ. ಆಂಬ್ಯುಲೆನ್ಸ್: 108.',
    emergency: 'ತುರ್ತು! ನಿಮ್ಮ ಪತಿಗೆ ಕರೆಯುತ್ತಿದ್ದೇವೆ.',
    listening: 'ಕೇಳುತ್ತಿದ್ದೇನೆ...',
    notHeard: 'ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.',
    tapToSpeak: 'ಮಾತನಾಡಲು ಸ್ಪರ್ಶಿಸಿ'
  }
}

export function useVoice(language = 'en-IN') {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('Tap the orb to speak')
  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)

  const getLang = useCallback(() => LANG_RESPONSES[language] || LANG_RESPONSES['en-IN'], [language])

  const speak = useCallback((text, lang) => {
    const synth = synthRef.current
    if (!synth) return
    synth.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = lang || language
    utt.rate = 0.92
    utt.pitch = 1.05

    // Pick best voice for language
    const voices = synth.getVoices()
    const match = voices.find(v => v.lang.startsWith(lang?.slice(0, 2) || language.slice(0, 2)))
    if (match) utt.voice = match

    utt.onstart = () => setIsSpeaking(true)
    utt.onend = () => setIsSpeaking(false)
    utt.onerror = () => setIsSpeaking(false)
    synth.speak(utt)
  }, [language])

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel()
    setIsSpeaking(false)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setStatus('Voice recognition not supported in this browser')
      return
    }

    stopSpeaking()
    const rec = new SpeechRecognition()
    rec.lang = language
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => { setIsListening(true); setStatus(getLang().listening) }

    rec.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(text)
    }

    rec.onend = () => { setIsListening(false); setStatus(getLang().tapToSpeak) }
    rec.onerror = () => { setIsListening(false); setStatus(getLang().notHeard) }

    recognitionRef.current = rec
    rec.start()
  }, [language, getLang, stopSpeaking])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) stopListening()
    else startListening()
  }, [isListening, startListening, stopListening])

  return {
    isListening, isSpeaking, transcript, status, setStatus,
    speak, stopSpeaking, startListening, stopListening, toggleListening, getLang
  }
}
