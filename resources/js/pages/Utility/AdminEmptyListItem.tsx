import { TableCell, TableRow } from "@/components/ui/table";
import { Inbox } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
  icon?: React.ElementType;
  colSpan?: number;
}

export default function AdminEmptyListItem({
  title = "No items yet",
  message = "Items you add will appear here.",
  icon: Icon = Inbox,
  colSpan = 5,
}: Props) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-8">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Icon className="w-10 h-10 mb-2 text-gray-400" />
          <p className="text-sm md:text-[16px] font-bold p-1">{title}</p>
          <p className="text-xs text-gray-400 p-1">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
