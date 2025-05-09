
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Dictionary } from "@/lib/dictionaries";
import { useToast } from "@/hooks/use-toast";

interface VoiceAssistantProps {
  dictionary: Dictionary;
  currentLanguage: string;
}

export function VoiceAssistant({ dictionary, currentLanguage }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
        }
        
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        // Setting language codes with fallbacks for better browser compatibility
        let languageCode = "en-IN"; // Default fallback

        // Try specific language codes first, with fallbacks
        if (currentLanguage === "hi") {
          languageCode = "hi-IN";
        } else if (currentLanguage === "bn") {
          languageCode = "bn-IN";
        } else if (currentLanguage === "ml") {
          languageCode = "ml-IN";
        } else if (currentLanguage === "ta") {
          languageCode = "ta-IN";
        } else if (currentLanguage === "pa") {
          // Try multiple Punjabi language codes
          // Some browsers use "pa" or "pa-IN", others might use "pa-Guru-IN"
          try {
            languageCode = "pa-IN";
            // We'll also attempt "pa" and "pa-Guru-IN" if this fails via error handler
          } catch (error) {
            console.error("Failed to set language to pa-IN, will try fallbacks:", error);
          }
        }
        
        recognitionRef.current.lang = languageCode;
        console.log(`Speech recognition initialized with language: ${recognitionRef.current.lang}`);
        
        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          const isFinal = event.results[current].isFinal;
          
          console.log(`Speech recognized: "${transcriptText}"`);
          console.log(`Is final: ${isFinal}`);
          console.log(`Current language: ${currentLanguage}`);
          
          setTranscript(transcriptText);
          
          if (isFinal && transcriptText.trim()) {
            generateResponse(transcriptText);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          
          // Special handling for "not-allowed" and "service-not-allowed" errors
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            console.log("Speech recognition service not allowed, trying fallback");
            setIsSpeechRecognitionSupported(false);
            
            // If it's specifically a Punjabi language issue, try fallback languages
            if (currentLanguage === "pa") {
              tryPunjabiAlternatives();
            } else {
              toast({
                title: dictionary.notSupported || "Not supported",
                description: dictionary.browserNotSupported || 
                  "Your browser doesn't support speech recognition for this language. You can still type your query.",
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: dictionary.errorOccurred || "Error occurred",
              description: event.error,
              variant: "destructive",
            });
          }
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          console.log("Speech recognition ended");
        };
      } else {
        setIsSpeechRecognitionSupported(false);
        toast({
          title: dictionary.notSupported || "Not supported",
          description: dictionary.browserNotSupported || "Your browser doesn't support speech recognition",
          variant: "destructive",
        });
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentLanguage, dictionary, toast]);
  
  // Function to try alternative language codes for Punjabi
  const tryPunjabiAlternatives = () => {
    const alternativeCodes = ["pa", "pa-Guru-IN", "pa-Guru", "hi-IN"]; // Try Hindi as ultimate fallback
    let alternativeFound = false;
    
    // We'll try each code in sequence
    for (const code of alternativeCodes) {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = code;
          console.log(`Trying alternative language code: ${code}`);
          alternativeFound = true;
          
          // If we found a working alternative, toast a message
          toast({
            title: "Using alternative recognition",
            description: `Using ${code} as fallback for Punjabi speech recognition`,
            duration: 3000,
          });
          
          break;
        }
      } catch (error) {
        console.error(`Failed to set language to ${code}:`, error);
      }
    }
    
    if (!alternativeFound) {
      // If no alternatives worked, suggest text input
      toast({
        title: dictionary.notSupported || "Not supported",
        description: "Punjabi voice recognition is currently unavailable. Please use Hindi or English instead.",
        variant: "destructive",
      });
    }
  };
  
  const toggleListening = () => {
    if (!isSpeechRecognitionSupported) {
      toast({
        title: dictionary.notSupported || "Not supported",
        description: dictionary.browserNotSupported || 
          "Your browser doesn't support speech recognition for this language. Try a different language or browser.",
        variant: "destructive",
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setResponse("");
      recognitionRef.current?.start();
      setIsListening(true);
      console.log("Started listening");
    }
  };
  
  const generateResponse = (text: string) => {
    const lowerText = text.toLowerCase();
    let responseText = "";
    
    console.log(`Generating response for language: ${currentLanguage}, text: "${lowerText}"`);
    
    if (currentLanguage === "ml") {
      if (lowerText.includes("നമസ്കാരം") || lowerText.includes("ഹലോ")) {
        responseText = "നമസ്കാരം! സർക്കാർ പദ്ധതികളെക്കുറിച്ച് അറിയാൻ ഞാൻ സഹായിക്കാം. ഏത് തരം പദ്ധതികളെക്കുറിച്ചാണ് അറിയാൻ ആഗ്രഹിക്കുന്നത്?";
      }
      else if (lowerText.includes("ആരോഗ്യം") || lowerText.includes("വൈദ്യം")) {
        responseText = "ആയുഷ്മാൻ ഭാരത് പദ്ധതിക്ക് നിങ്ങൾക്ക് അർഹതയുണ്ടാകാം. ഇത് കുടുംബത്തിന് പ്രതിവർഷം 5 ലക്ഷം രൂപയുടെ ആരോഗ്യ ഇൻഷുറൻസ് പരിരക്ഷ നൽകുന്നു.";
      }
      else if (lowerText.includes("വിദ്യാഭ്യാസം") || lowerText.includes("സ്കൂൾ")) {
        responseText = "വിദ്യാർത്ഥികൾക്കായി സ്കോളർഷിപ്പുകൾ ഉൾപ്പെടെയുള്ള നിരവധി വിദ്യാഭ്യാസ പദ്ധതികൾ ലഭ്യമാണ്. ഉന്നത വിദ്യാഭ്യാസത്തിന് പിഎം വിദ്യ പദ്ധതി സാമ്പത്തിക സഹായം നൽകുന്നു.";
      }
      else if (lowerText.length > 0) {
        responseText = "എനിക്ക് ആരോഗ്യം, വിദ്യാഭ്യാസം, കൃഷി, വീട്, തൊഴിൽ, സ്ത്രീകളുടെയും കുട്ടികളുടെയും ക്ഷേമം തുടങ്ങിയ മേഖലകളിലെ സർക്കാർ പദ്ധതികൾ കണ്ടെത്താൻ സഹായിക്കാം. ഏത് മേഖലയിലാണ് താൽപ്പര്യമുള്ളത്?";
      }
    }
    else if (currentLanguage === "ta") {
      if (lowerText.includes("வணக்கம்") || lowerText.includes("ஹலோ")) {
        responseText = "வணக்கம்! அரசு திட்டங்களைப் பற்றி அறிய நான் உதவ முடியும். எந்த வகையான திட்டங்களைப் பற்றி தெரிந்துகொள்ள விரும்புகிறீர்கள்?";
      }
      else if (lowerText.includes("சுகாதாரம்") || lowerText.includes("மருத்துவம்")) {
        responseText = "நீங்கள் ஆயுஷ்மான் பாரத் திட்டத்திற்கு தகுதி பெறலாம். இது குடும்பத்திற்கு ஆண்டுக்கு ரூ.5 லட்சம் வரை சுகாதார காப்பீட்டு பாதுகாப்பை வழங்குகிறது.";
      }
      else if (lowerText.includes("கல்வி") || lowerText.includes("பள்ளி")) {
        responseText = "மாணவர்களுக்கான உதவித்தொகை போன்ற பல கல்வித் திட்டங்கள் உள்ளன. உயர்கல்விக்கு பிஎம் வித்யா திட்டம் நிதி உதவி வழங்குகிறது.";
      }
      else if (lowerText.length > 0) {
        responseText = "சுகாதாரம், கல்வி, வேளாண்மை, வீட்டுவசதி, வேலைவாய்ப்பு மற்றும் பெண்கள் & குழந்தைகள் நலன் போன்ற துறைகளில் அரசு திட்டங்களைக் கண்டறிய நான் உதவ முடியும். எந்தத் துறையில் உங்களுக்கு ஆர்வம் உள்ளது?";
      }
    }
    else if (currentLanguage === "pa") {
      // Enhanced Punjabi language support with more keywords and variations
      if (lowerText.includes("ਸਤ ਸ੍ਰੀ ਅਕਾਲ") || lowerText.includes("ਹੈਲੋ") || lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("sat sri akal") || lowerText.includes("namaste") || lowerText.includes("ਨਮਸਤੇ")) {
        responseText = "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਨੂੰ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਬਾਰੇ ਜਾਣਨ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ/ਸਕਦੀ ਹਾਂ। ਤੁਸੀਂ ਕਿਸ ਤਰ੍ਹਾਂ ਦੀਆਂ ਯੋਜਨਾਵਾਂ ਬਾਰੇ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?";
      }
      else if (lowerText.includes("ਸਿਹਤ") || lowerText.includes("ਮੈਡੀਕਲ") || lowerText.includes("ਹਸਪਤਾਲ") || lowerText.includes("ਡਾਕਟਰ") || lowerText.includes("health") || lowerText.includes("medical") || lowerText.includes("hospital") || lowerText.includes("doctor") || lowerText.includes("sehat") || lowerText.includes("dawai") || lowerText.includes("ਦਵਾਈ")) {
        responseText = "ਇੱਕ ਸਿਹਤ ਯੋਜਨਾ ਵਜੋਂ, ਤੁਸੀਂ ਆਯੂਸ਼ਮਾਨ ਭਾਰਤ ਲਈ ਯੋਗ ਹੋ ਸਕਦੇ ਹੋ ਜੋ ਪ੍ਰਤੀ ਪਰਿਵਾਰ ਪ੍ਰਤੀ ਸਾਲ 5 ਲੱਖ ਰੁਪਏ ਤੱਕ ਦਾ ਸਿਹਤ ਬੀਮਾ ਕਵਰੇਜ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ। ਕੀ ਤੁਸੀਂ ਹੋਰ ਸਿਹਤ ਯੋਜਨਾਵਾਂ ਬਾਰੇ ਜਾਣਨਾ ਚਾਹੋਗੇ?";
      }
      else if (lowerText.includes("ਸਿੱਖਿਆ") || lowerText.includes("ਸਕੂਲ") || lowerText.includes("ਕਾਲਜ") || lowerText.includes("ਪੜ੍ਹਾਈ") || lowerText.includes("education") || lowerText.includes("school") || lowerText.includes("college") || lowerText.includes("padhai") || lowerText.includes("vidya") || lowerText.includes("ਵਿਦਿਆ")) {
        responseText = "ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਵਜ਼ੀਫ਼ੇ ਵਰਗੀਆਂ ਕਈ ਸਿੱਖਿਆ ਯੋਜਨਾਵਾਂ ਹਨ। ਪੀਐਮ ਵਿਦਿਆ ਯੋਜਨਾ ਉੱਚ ਸਿੱਖਿਆ ਲਈ ਵਿੱਤੀ ਸਹਾਇਤਾ ਪ੍ਰਦਾਨ ਕਰਦੀ ਹੈ। ਕੀ ਤੁਸੀਂ ਹੋਰ ਜਾਣਨਾ ਚਾਹੋਗੇ?";
      }
      else if (lowerText.includes("ਕਿਸਾਨ") || lowerText.includes("ਖੇਤੀ") || lowerText.includes("ਫਸਲ") || lowerText.includes("farmer") || lowerText.includes("agriculture") || lowerText.includes("farming") || lowerText.includes("kheti") || lowerText.includes("fasal") || lowerText.includes("zameen") || lowerText.includes("ਜ਼ਮੀਨ")) {
        responseText = "ਇੱਕ ਕਿਸਾਨ ਵਜੋਂ, ਤੁਸੀਂ ਪੀਐਮ-ਕਿਸਾਨ ਲਈ ਯੋਗ ਹੋ ਸਕਦੇ ਹੋ ਜੋ ਸਾਲਾਨਾ 6,000 ਰੁਪਏ ਦੀ ਆਮਦਨੀ ਸਹਾਇਤਾ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ। ਫਸਲ ਬੀਮਾ ਅਤੇ ਸਬਸਿਡੀ ਵਾਲੇ ਉਪਕਰਣਾਂ ਲਈ ਵੀ ਯੋਜਨਾਵਾਂ ਹਨ।";
      }
      else if (lowerText.includes("ਘਰ") || lowerText.includes("ਰਿਹਾਇਸ਼") || lowerText.includes("ਮਕਾਨ") || lowerText.includes("house") || lowerText.includes("housing") || lowerText.includes("home") || lowerText.includes("ghar") || lowerText.includes("makaan") || lowerText.includes("rehaish")) {
        responseText = "ਪੀਐਮ ਆਵਾਸ ਯੋਜਨਾ ਘੱਟ ਆਮਦਨੀ ਵਾਲੇ ਪਰਿਵਾਰਾਂ ਲਈ ਰਿਹਾਇਸ਼ੀ ਸਹਾਇਤਾ ਪ੍ਰਦਾਨ ਕਰਦੀ ਹੈ। ਤੁਸੀਂ ਘਰ ਦੇ ਕਰਜ਼ੇ 'ਤੇ ਸਬਸਿਡੀ ਜਾਂ ਸਿੱਧੀ ਵਿੱਤੀ ਸਹਾਇਤਾ ਲਈ ਯੋਗ ਹੋ ਸਕਦੇ ਹੋ।";
      }
      else if (lowerText.includes("ਨੌਕਰੀ") || lowerText.includes("ਰੁਜ਼ਗਾਰ") || lowerText.includes("ਕੰਮ") || lowerText.includes("job") || lowerText.includes("employment") || lowerText.includes("work") || lowerText.includes("naukri") || lowerText.includes("rozgaar") || lowerText.includes("kaam")) {
        responseText = "ਹੁਨਰ ਵਿਕਾਸ ਅਤੇ ਨੌਕਰੀ ਦੀ ਸਿਖਲਾਈ ਲਈ ਪੀਐਮਕੇਵੀਵਾਈ ਵਰਗੀਆਂ ਰੁਜ਼ਗਾਰ ਯੋਜਨਾਵਾਂ ਹਨ। ਮੁਦਰਾ ਯੋਜਨਾ ਛੋਟੇ ਕਾਰੋਬਾਰਾਂ ਅਤੇ ਉੱਦਮੀਆਂ ਲਈ ਕਰਜ਼ੇ ਪ੍ਰਦਾਨ ਕਰਦੀ ਹੈ।";
      }
      else if (lowerText.includes("ਔਰਤ") || lowerText.includes("ਬੱਚਾ") || lowerText.includes("ਕੁੜੀ") || lowerText.includes("women") || lowerText.includes("child") || lowerText.includes("girl") || lowerText.includes("aurat") || lowerText.includes("baccha") || lowerText.includes("kudi") || lowerText.includes("ladki") || lowerText.includes("mahila") || lowerText.includes("ਮਹਿਲਾ")) {
        responseText = "ਔਰਤਾਂ ਅਤੇ ਬੱਚਿਆਂ ਲਈ ਯੋਜਨਾਵਾਂ ਵਿੱਚ ਬੇਟੀ ਬਚਾਓ ਬੇਟੀ ਪੜ੍ਹਾਓ ਅਤੇ ਲੜਕੀਆਂ ਦੀ ਸਿੱਖਿਆ ਅਤੇ ਭਲਾਈ ਲਈ ਸੁਕੰਨਿਆ ਸਮ੍ਰਿਧੀ ਯੋਜਨਾ ਸ਼ਾਮਲ ਹਨ। ਜਣੇਪਾ ਛੁੱਟੀ ਅਤੇ ਜਨਨੀ ਸੁਰੱਖਿਆ ਯੋਜਨਾ ਵੀ ਉਪਲਬਧ ਹਨ।";
      }
      else if (lowerText.includes("ਯੋਜਨਾ") || lowerText.includes("ਸਕੀਮ") || lowerText.includes("ਸਰਕਾਰ") || lowerText.includes("scheme") || lowerText.includes("government") || lowerText.includes("yojana") || lowerText.includes("sarkar")) {
        responseText = "ਭਾਰਤ ਸਰਕਾਰ ਵੱਖ-ਵੱਖ ਸ਼੍ਰੇਣੀਆਂ ਵਿੱਚ ਕਈ ਯੋਜਨਾਵਾਂ ਪੇਸ਼ ਕਰਦੀ ਹੈ। ਤੁਸੀਂ ਕਿਸ ਖਾਸ ਖੇਤਰ ਵਿੱਚ ਸਹਾਇਤਾ ਚਾਹੁੰਦੇ ਹੋ? ਤੁਸੀਂ ਸਿਹਤ, ਸਿੱਖਿਆ, ਖੇਤੀਬਾੜੀ, ਰਿਹਾਇਸ਼, ਰੁਜ਼ਗਾਰ ਜਾਂ ਔਰਤਾਂ ਅਤੇ ਬੱਚਿਆਂ ਦੀ ਭਲਾਈ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।";
      }
      else if (lowerText.includes("ਬੁਢਾਪਾ") || lowerText.includes("ਪੇਂਸ਼ਨ") || lowerText.includes("old age") || lowerText.includes("pension") || lowerText.includes("senior") || lowerText.includes("budhapa") || lowerText.includes("budhe") || lowerText.includes("ਬੁੱਢੇ")) {
        responseText = "ਬਜ਼ੁਰਗਾਂ ਲਈ, ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਵਯ ਵੰਦਨਾ ਯੋਜਨਾ ਅਤੇ ਨੈਸ਼ਨਲ ਪੇਂਸ਼ਨ ਸਿਸਟਮ ਵਰਗੀਆਂ ਯੋਜਨਾਵਾਂ ਹਨ ਜੋ ਪੇਂਸ਼ਨ ਅਤੇ ਵਿੱਤੀ ਸੁਰੱਖਿਆ ਪ੍ਰਦਾਨ ਕਰਦੀਆਂ ਹਨ। ਬਜ਼ੁਰਗਾਂ ਲਈ ਸਿਹਤ ਸਹਾਇਤਾ ਵੀ ਉਪਲਬਧ ਹੈ।";
      }
      else if (lowerText.length > 0) {
        responseText = "ਮੈਂ ਤੁਹਾਨੂੰ ਸਿਹਤ, ਸਿੱਖਿਆ, ਖੇਤੀਬਾੜੀ, ਰਿਹਾਇਸ਼, ਰੁਜ਼ਗਾਰ ਅਤੇ ਔਰਤਾਂ ਅਤੇ ਬੱਚਿਆਂ ਦੀ ਭਲਾਈ ਵਰਗੇ ਖੇਤਰਾਂ ਵਿੱਚ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ/ਸਕਦੀ ਹਾਂ। ਤੁਸੀਂ ਕਿਸ ਖੇਤਰ ਵਿੱਚ ਦਿਲਚਸਪੀ ਰੱਖਦੇ ਹੋ?";
      }
    }
    else if (currentLanguage === "hi") {
      if (lowerText.includes("नमस्ते") || lowerText.includes("नमस्कार") || lowerText.includes("हैलो") || lowerText.includes("hello")) {
        responseText = "नमस्ते! मैं आपकी सरकारी योजनाओं के बारे में जानकारी पाने में मदद कर सकता हूँ। आप किस तरह की योजनाओं के बारे में जानना चाहते हैं?";
      }
      else if (lowerText.includes("स्वास्थ्य") || lowerText.includes("चिकित्सा") || lowerText.includes("health") || lowerText.includes("बीमारी") || lowerText.includes("अस्पताल") || lowerText.includes("डॉक्टर") || lowerText.includes("medical") || lowerText.includes("hospital")) {
        responseText = "आप आयुष्मान भारत के लिए पात्र हो सकते हैं जो प्रति परिवार प्रति वर्ष ₹5 लाख तक का स्वास्थ्य बीमा कवरेज प्रदान करता है। क्या आप स्वास्थ्य योजनाओं के बारे में और जानना चाहेंगे?";
      } 
      else if (lowerText.includes("शिक्षा") || lowerText.includes("विद्यालय") || lowerText.includes("कॉलेज") || lowerText.includes("education") || lowerText.includes("पढ़ाई") || lowerText.includes("स्कूल") || lowerText.includes("school") || lowerText.includes("college")) {
        responseText = "छात्रों के लिए कई शिक्षा योजनाएँ जैसे छात्रवृत्ति उपलब्ध हैं। पीएम विद्या योजना उच्च शिक्षा के लिए वित्तीय सहायता प्रदान करती है। क्या आप और जानना चाहेंगे?";
      } 
      else if (lowerText.includes("किसान") || lowerText.includes("कृषि") || lowerText.includes("खेती") || lowerText.includes("farmer") || lowerText.includes("फसल") || lowerText.includes("agriculture") || lowerText.includes("farming")) {
        responseText = "एक किसान के रूप में, आप पीएम-किसान के लिए पात्र हो सकते हैं जो प्रति वर्ष ₹6,000 का स्वास्थ्य बीमा कवरेज प्रदान करता है। फसल बीमा और सब्सिडी वाले उपकरणों के लिए भी योजनाएँ हैं।";
      } 
      else if (lowerText.includes("घर") || lowerText.includes("आवास") || lowerText.includes("मकान") || lowerText.includes("house") || lowerText.includes("गृह") || lowerText.includes("housing") || lowerText.includes("home")) {
        responseText = "पीएम आवास योजना कम आय वाले परिवारों के लिए आवास सहायता प्रदान करती है। आप गृह ऋण पर सब्सिडी या प्रत्यक्ष वित्तीय सहायता के लिए पात्र हो सकते हैं।";
      } 
      else if (lowerText.includes("नौकरी") || lowerText.includes("रोजगार") || lowerText.includes("काम") || lowerText.includes("job") || lowerText.includes("व्यवसाय") || lowerText.includes("employment") || lowerText.includes("work")) {
        responseText = "कौशल विकास और नौकरी प्रशिक्षण के लिए पीएमकेवीवाई जैसी रोजगार योजनाएँ हैं। मुद्रा योजना छोटे व्यवसायों और उद्यमियों के लिए ऋण प्रदान करती है।";
      } 
      else if (lowerText.includes("महिला") || lowerText.includes("बच्चा") || lowerText.includes("बेटी") || lowerText.includes("women") || lowerText.includes("child") || lowerText.includes("लड़की") || lowerText.includes("girl")) {
        responseText = "महिलाओं और बच्चों के लिए योजनाओं में बेटी बचाओ बेटी पढाओ और बालिका शिक्षा और कल्याण के लिए सुकन्या समृद्धि योजना शामिल हैं।";
      } 
      else if (lowerText.includes("योजना") || lowerText.includes("scheme") || lowerText.includes("government") || lowerText.includes("सरकार") || lowerText.includes("सरकारी") || lowerText.includes("सुनो और जानो")) {
        responseText = "भारत सरकार द्वारा विभिन्न श्रेणियों में कई योजनाएँ प्रदान की जाती हैं। आप किस विशेष क्षेत्र में सहायता चाहते हैं? स्वास्थ्य, शिक्षा, कृषि, आवास, रोजगार या महिला एवं बाल कल्याण के बारे में पूछ सकते हैं।";
      }
      else if (lowerText.length > 0) {
        responseText = "मैं आपको स्वास्थ्य, शिक्षा, कृषि, आवास, रोजगार और महिला एवं बाल कल्याण जैसे क्षेत्रों में सरकारी योजनाएँ खोजने में मदद कर सकता हूँ। क्या आप बता सकते हैं कि आप किस क्षेत्र में रुचि रखते हैं?";
      }
    } 
    else if (currentLanguage === "bn") {
      if (lowerText.includes("স্বাস্থ্য") || lowerText.includes("চিকিত্সা") || lowerText.includes("health")) {
        responseText = "আপনি আয়ুষ্মান ভারতের জন্য যোগ্য হতে পারেন যা প্রতি পরিবারকে প্রতি বছর ₹5 লক্ষ পর্যন্ত স্বাস্থ্য বীমা কভারেজ প্রদান করে। আপনি কি স্বাস্থ্য প্রকল্পগুলি সম্পর্কে আরও জানতে চান?";
      } else if (lowerText.includes("শিক্ষা") || lowerText.includes("স্কুল") || lowerText.includes("কলেজ") || lowerText.includes("education")) {
        responseText = "ছাত্রদের জন্য বৃত্তির মতো বেশ কয়েকটি শিক্ষা প্রকল্প রয়েছে। পিএম বিদ্যা প্রকল্প উচ্চ শিক্ষার জন্য আর্থিক সহায়তা প্রদান করে। আপনি কি আরও জানতে চান?";
      } else if (lowerText.includes("কৃষক") || lowerText.includes("কৃষি") || lowerText.includes("চাষ") || lowerText.includes("farmer")) {
        responseText = "একজন কৃষক হিসাবে, আপনি পিএম-কিষাণের জন্য যোগ্য হতে পারেন যা বছরে ₹6,000 আয় সহায়তা প্রদান করে। ফসল বীমা এবং ভর্তুকি প্রাপ্ত সরঞ্জামের জন্যও প্রকল্প রয়েছে।";
      } else if (lowerText.includes("বাড়ি") || lowerText.includes("আবাসন") || lowerText.includes("ঘর") || lowerText.includes("house")) {
        responseText = "পিএম আবাস যোজনা কম আয়ের পরিবারের জন্য আবাসন সহায়তা প্রদান করে। আপনি হোম লোনে ভর্তুকি বা সরাসরি আর্থিক সহায়তার জন্য যোগ্য হতে পারেন।";
      } else if (lowerText.includes("চাকরি") || lowerText.includes("কর্মসংস্থান") || lowerText.includes("কাজ") || lowerText.includes("job")) {
        responseText = "দক্ষতা উন্নয়ন এবং কাজের প্রশিক্ষণের জন্য পিএমকেভিওয়াইয়ের মতো কর্মসংস্থান প্রকল্প রয়েছে। মুদ্রা যোজনা ক্ষুদ্র ব্যবসা এবং উদ্যোক্তাদের জন্য ঋণ প্রদান করে।";
      } else if (lowerText.includes("মহিলা") || lowerText.includes("শিশু") || lowerText.includes("মেয়ে") || lowerText.includes("women") || lowerText.includes("child")) {
        responseText = "মহিলা ও শিশুদের জন্য প্রকল্পগুলির মধ্যে রয়েছে বেটি বাঁচাও বেটি পড়াও এবং কন্যা শিশু শিক্ষা ও কল্যাণের জন্য সুকন্যা সমৃদ্ধি যোজনা।";
      } else if (lowerText.length > 0) {
        responseText = "আমি আপনাকে স্বাস্থ্য, শিক্ষা, কৃষি, আবাসন, কর্মসংস্থান এবং মহিলা ও শিশু কল্যাণের মতো বিভাগে সরকারি প্রকল্প খুঁজে পেতে সাহায্য করতে পারি। আপনি কোন ক্ষেত্রে আগ্রহী তা জানাতে পারেন?";
      }
    } 
    else { // English
      if (lowerText.includes("hello") || lowerText.includes("hi ") || lowerText.includes("hey") || lowerText.startsWith("hi") || lowerText.includes("greetings")) {
        responseText = "Hello! I can help you learn about government schemes. What kind of schemes are you interested in?";
      } else if (lowerText.includes("health") || lowerText.includes("medical") || lowerText.includes("hospital") || lowerText.includes("doctor")) {
        responseText = "You may be eligible for Ayushman Bharat which provides health insurance coverage up to ₹5 lakh per family per year. Would you like to know more about health schemes?";
      } else if (lowerText.includes("education") || lowerText.includes("school") || lowerText.includes("college") || lowerText.includes("student")) {
        responseText = "There are several education schemes like scholarships for students. The PM Vidya scheme provides financial assistance for higher education. Would you like to know more?";
      } else if (lowerText.includes("farmer") || lowerText.includes("agriculture") || lowerText.includes("farming") || lowerText.includes("crop")) {
        responseText = "As a farmer, you may be eligible for PM-KISAN which provides income support of ₹6,000 per year. There are also schemes for crop insurance and subsidized equipment.";
      } else if (lowerText.includes("house") || lowerText.includes("home") || lowerText.includes("housing") || lowerText.includes("accommodation")) {
        responseText = "PM Awas Yojana provides housing assistance for low-income families. You may be eligible for subsidies on home loans or direct financial assistance.";
      } else if (lowerText.includes("job") || lowerText.includes("employment") || lowerText.includes("work") || lowerText.includes("career")) {
        responseText = "There are employment schemes like PMKVY for skill development and job training. MUDRA Yojana provides loans for small businesses and entrepreneurs.";
      } else if (lowerText.includes("women") || lowerText.includes("child") || lowerText.includes("girl") || lowerText.includes("mother")) {
        responseText = "Schemes for women and children include Beti Bachao Beti Padhao and Sukanya Samriddhi Yojana for girl child education and welfare.";
      } else if (lowerText.length > 0) {
        responseText = "I can help you find government schemes in categories like health, education, agriculture, housing, employment, and women & child welfare. Could you specify which area you're interested in?";
      }
    }
    
    console.log("Generated response:", responseText);
    
    if (responseText) {
      setResponse(responseText);
      speakResponse(responseText);
    } else {
      const fallbackResponse = currentLanguage === "hi" 
        ? "मुझे क्षमा करें, मैं आपके प्रश्न को समझ नहीं पाया। कृपया स्वास्थ्य, शिक्षा, कृषि, आवास, रोजगार या महिला एवं बाल कल्याण जैसे विषयों के बारे में पूछें।"
        : currentLanguage === "bn" 
        ? "দুঃখিত, আমি আপনার প্রশ্ন বুঝতে পারিনি। অনুগ্রহ করে স্বাস্থ্য, শিক্ষা, কৃষি, আবাসন, কর্মসংস্থান বা মহিলা ও শিশু কল্যাণ সম্পর্কে প্রশ্ন করুন।"
        : currentLanguage === "ta"
        ? "மன்னிக்கவும், உங்கள் கேள்வியை புரிந்துகொள்ள முடியவில்லை. சுகாதாரம், கல்வி, வேளாண்மை, வீட்டுவசதி, வேலைவாய்ப்பு அல்லது பெண்கள் & குழந்தைகள் நலன் போன்ற தலைப்புகளைப் பற்றி கேட்கவும்."
        : currentLanguage === "pa"
        ? "ਮੈਨੂੰ ਮਾਫ ਕਰਨਾ, ਮੈਂ ਤੁਹਾਡੇ ਸਵਾਲ ਨੂੰ ਸਮਝ ਨਹੀਂ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਸਿਹਤ, ਸਿੱਖਿਆ, ਖੇਤੀਬਾੜੀ, ਰਿਹਾਇਸ਼, ਰੁਜ਼ਗਾਰ, ਬੁਢਾਪਾ ਪੇਂਸ਼ਨ ਜਾਂ ਔਰਤਾਂ ਅਤੇ ਬੱਚਿਆਂ ਦੀ ਭਲਾਈ ਵਰਗੇ ਵਿਸ਼ਿਆਂ ਬਾਰੇ ਪੁੱਛੋ।"
        : "I'm sorry, I didn't understand your question. Please ask about topics like health, education, agriculture, housing, employment, or women & child welfare.";
      
      setResponse(fallbackResponse);
      speakResponse(fallbackResponse);
    }
  };
  
  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const speech = new SpeechSynthesisUtterance();
      speech.text = text;
      
      // Setting speech language with better fallback mechanisms
      if (currentLanguage === "pa") {
        // For Punjabi, try multiple language codes with Hindi as fallback
        try {
          speech.lang = "pa-IN";
        } catch (error) {
          console.error("Failed to set TTS language to pa-IN, trying alternatives:", error);
          try {
            speech.lang = "pa";
          } catch (error) {
            console.error("Failed to set TTS language to pa, using Hindi fallback:", error);
            speech.lang = "hi-IN"; // Hindi as fallback for Punjabi
          }
        }
      } else {
        // For other languages, use standard codes
        speech.lang = currentLanguage === "hi" ? "hi-IN" : 
                      currentLanguage === "bn" ? "bn-IN" : 
                      currentLanguage === "ta" ? "ta-IN" :
                      currentLanguage === "ml" ? "ml-IN" : "en-US";
      }
      
      console.log(`Using speech synthesis with language: ${speech.lang}`);
      
      speech.volume = 1;
      speech.rate = 0.9;
      speech.pitch = 1;
      
      let voices = window.speechSynthesis.getVoices();
      
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          setVoiceAndSpeak(voices, speech);
        };
      } else {
        setVoiceAndSpeak(voices, speech);
      }
      
      function setVoiceAndSpeak(availableVoices: SpeechSynthesisVoice[], utterance: SpeechSynthesisUtterance) {
        if (availableVoices.length > 0) {
          console.log("Available voices for speech:", availableVoices.length);
          
          // Primary language code for voice selection
          let langPrefix = currentLanguage === "hi" ? "hi" : 
                         currentLanguage === "bn" ? "bn" :
                         currentLanguage === "ta" ? "ta" :
                         currentLanguage === "pa" ? "pa" :
                         currentLanguage === "ml" ? "ml" : "en";
          
          console.log(`Looking for voice with language prefix: ${langPrefix}`);
          
          // Prioritize exact matches for the language
          let langVoices = availableVoices.filter(voice => 
            voice.lang.toLowerCase().startsWith(langPrefix.toLowerCase())
          );
          
          // For Punjabi, also try voices that contain "punjabi" in their name
          if (currentLanguage === "pa" && langVoices.length === 0) {
            langVoices = availableVoices.filter(voice => 
              voice.name.toLowerCase().includes("punjabi") || 
              voice.name.toLowerCase().includes("panjabi")
            );
            
            // If still no voices, try hindi as fallback
            if (langVoices.length === 0) {
              langPrefix = "hi";
              langVoices = availableVoices.filter(voice => 
                voice.lang.toLowerCase().startsWith(langPrefix.toLowerCase())
              );
              console.log(`No Punjabi voices found, using Hindi as fallback`);
            }
          }
          
          console.log(`Found ${langVoices.length} matching voices for ${langPrefix}`);
          
          if (langVoices.length > 0) {
            utterance.voice = langVoices[0];
            console.log(`Selected voice: ${utterance.voice.name} (${utterance.voice.lang})`);
          } else {
            // Fallback to Indian voices
            const indianVoices = availableVoices.filter(voice => 
              voice.lang.endsWith("-IN")
            );
            
            if (indianVoices.length > 0) {
              utterance.voice = indianVoices[0];
              console.log(`Selected Indian voice: ${utterance.voice.name} (${utterance.voice.lang})`);
            } else {
              // If no Indian voices, try Google voices as they often have better support
              const googleVoices = availableVoices.filter(voice => 
                voice.name.includes("Google")
              );
              
              if (googleVoices.length > 0) {
                utterance.voice = googleVoices[0];
                console.log(`Selected Google voice: ${utterance.voice.name} (${utterance.voice.lang})`);
              }
            }
          }
        }
        
        utterance.onstart = () => {
          console.log("Speech started");
        };
        
        utterance.onend = () => {
          console.log("Speech ended");
        };
        
        utterance.onerror = (event) => {
          console.error("Speech error:", event);
        };
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      toast({
        title: dictionary.notSupported || "Not supported",
        description: dictionary.speechNotSupported || "Your browser doesn't support text-to-speech",
        variant: "destructive",
      });
    }
  };
  
  const handleSpeakResponse = () => {
    if (response) {
      speakResponse(response);
    } else {
      toast({
        title: dictionary.noResponse || "No response",
        description: dictionary.noResponseMessage || "There is no response to read",
        variant: "destructive",
      });
    }
  };
  
  // Detect text input if speech recognition fails
  const [textInput, setTextInput] = useState("");
  
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      setTranscript(textInput);
      generateResponse(textInput);
      setTextInput("");
    }
  };
  
  useEffect(() => {
    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log(`Loaded ${voices.length} voices`);
    };
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      handleVoicesChanged();
    }
  }, []);
  
  return (
    <>
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-desi-blue hover:bg-desi-blue/90 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Mic className="h-6 w-6" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{dictionary.voiceAssistantActivated || "Voice Assistant"}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 p-4">
            {transcript && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">{dictionary.youSaid || "You said"}</p>
                <p className="text-gray-900">{transcript}</p>
              </div>
            )}
            
            {response && (
              <div className="bg-desi-blue/10 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-desi-blue">{dictionary.assistantResponse || "Assistant"}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={handleSpeakResponse}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-gray-900">{response}</p>
              </div>
            )}
            
            <div className="flex justify-center pt-4">
              <Button
                className={`rounded-full w-16 h-16 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-desi-blue hover:bg-desi-blue/90'}`}
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </div>
            
            {!isSpeechRecognitionSupported && (
              <form onSubmit={handleTextSubmit} className="flex gap-2 mt-4">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-desi-blue"
                  placeholder={dictionary.typeYourQuestion || "Type your question instead"}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                <Button type="submit" className="bg-desi-blue hover:bg-desi-blue/90">
                  {dictionary.send || "Send"}
                </Button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
