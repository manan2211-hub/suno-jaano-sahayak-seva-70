import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface TimelineDisplayProps {
  timelines: SchemeTimeline[];
  dictionary: Record<string, string>;
}

export function TimelineDisplay({ timelines, dictionary }: TimelineDisplayProps) {
  const getStatusColor = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-orange-600 bg-orange-50";
      case "upcoming":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div>
      {timelines.map((timeline) => (
        <div key={timeline.id} className="mb-6 last:mb-0">
          <h3 className="text-lg font-medium mb-3">{timeline.name}</h3>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dictionary.date || "Date"}</TableHead>
                  <TableHead>{dictionary.milestone || "Milestone"}</TableHead>
                  <TableHead>{dictionary.status || "Status"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeline.events.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.milestone}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}