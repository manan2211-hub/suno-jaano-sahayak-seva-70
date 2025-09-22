import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";
import { VoiceReview } from "@/components/VoiceReview";
import { VoiceReviewSettings } from "@/components/VoiceReviewSettings";
import { TimelineDisplay } from "@/components/TimelineDisplay";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface TimelineEvent {
  date: string;
  milestone: string;
  status: "upcoming" | "completed" | "pending";
}

interface SchemeTimeline {
  id: string;
  name: string;
  events: TimelineEvent[];
}

interface VoiceReview {
  id: string;
  userName: string;
  schemeName: string;
  reviewText: string;
  language: string;
}

const sampleTimelines: SchemeTimeline[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    events: [
      {
        date: "2024-05-01",
        milestone: "Application Window Opens",
        status: "upcoming"
      },
      {
        date: "2024-06-15",
        milestone: "Document Verification Deadline",
        status: "upcoming"
      },
      {
        date: "2024-07-01",
        milestone: "First Installment Release",
        status: "upcoming"
      }
    ]
  },
  {
    id: "awas-yojana",
    name: "PM Awas Yojana",
    events: [
      {
        date: "2024-04-30",
        milestone: "Registration Deadline",
        status: "pending"
      },
      {
        date: "2024-05-15",
        milestone: "Document Submission",
        status: "upcoming"
      },
      {
        date: "2024-06-01",
        milestone: "Approval Process",
        status: "upcoming"
      }
    ]
  }
];

const sampleVoiceReviews: VoiceReview[] = [
  {
    id: "review-1",
    userName: "राजेश कुमार",
    schemeName: "PM-KISAN",
    reviewText: "पीएम-किसान योजना के माध्यम से मुझे समय पर सहायता मिली। आवेदन प्रक्रिया सरल थी, और इन निधियों ने मुझे आवश्यक कृषि उपकरण खरीदने में मदद की।",
    language: "hi-IN"
  },
  {
    id: "review-2",
    userName: "Sarah Williams",
    schemeName: "PM Awas Yojana",
    reviewText: "The Awas Yojana scheme provided my family with proper housing. The application process was straightforward and the financial assistance has truly transformed our lives for the better.",
    language: "en-US"
  },
  {
    id: "review-3",
    userName: "অমিত ঘোষ",
    schemeName: "PM-KISAN",
    reviewText: "পিএম-কিষাণ প্রকল্প থেকে পাওয়া ত্রৈমাসিক অর্থ সাহায্য আমাকে কৃষি চাহিদা মেটাতে সাহায্য করেছে। এই অর্থ সাহায্য ছাড়া আমি সময়মত চাষ করতে পারতাম না।",
    language: "bn-IN"
  }
];

interface SchemeTimelineProps {
  dictionary: Record<string, string>;
}

export function SchemeTimeline({ dictionary }: SchemeTimelineProps) {
  const { playingReviewId, playReview, stopReview } = useSpeechSynthesis();

  const handlePlayToggle = async (review: VoiceReview) => {
    await playReview(review);
  };

  return (
    <div className="space-y-6">
      <VoiceReviewSettings dictionary={dictionary} />
      
      <Card className="w-full border-2 border-desi-purple/10 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-desi-purple/10 to-desi-blue/10">
        <CardTitle className="flex items-center gap-2 text-center text-desi-textDark">
          <Timer className="h-6 w-6" />
          {dictionary.schemeTimeline || "Scheme Timeline Tracker"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <TimelineDisplay timelines={sampleTimelines} dictionary={dictionary} />
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">{dictionary.beneficiaryReviews || "Beneficiary Reviews"}</h3>
          <div className="grid gap-4">
            {sampleVoiceReviews.map((review) => (
              <VoiceReview
                key={review.id}
                review={review}
                dictionary={dictionary}
                isPlaying={playingReviewId === review.id}
                onPlayToggle={handlePlayToggle}
                onStop={stopReview}
              />
            ))}
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}
