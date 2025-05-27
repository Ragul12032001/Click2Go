import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { FiFilter } from "react-icons/fi";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"; 
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command"; 
import { CheckIcon } from "lucide-react"; 
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../State/store";

interface DropdownMenuDemoProps {
  workspaceId: number;
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  setColumnsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}


const DropdownMenuDemo: React.FC<DropdownMenuDemoProps> = ({
  visibleColumns,
  setVisibleColumns,
  setColumnsLoading, 
  
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );

  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");

  // Default columns that are always shown
  const defaultColumns = [
    { value: "campaign_name", label: "Campaign Name" },
    { value: "channel_type", label: "Channel" },
    { value: "status", label: "Status" },
    { value: "start_date_time", label: "Start Date" },
    { value: "campaign_budget", label: "Budget" },
    { value: "sent", label: "Sent" },
  ];

  // Extra columns for user selection
  const extraColumns = [
   
    { value: "delivered", label: "Delivered" },
    { value: "read", label: "Read" },
    { value: "ctr", label: "CTR" },
    { value: "delivery_rate", label: "Delivery Rate" },
    { value: "button_click", label: "Button Click" },
  ];

  // Combine default columns and selected columns for display
  const displayedColumns = [
    ...defaultColumns.map((col) => col.value), // Always include default columns
    ...(visibleColumns || []), // Add user-selected columns, fallback to empty array
  ];

  // Debugging: Log the combined columns
  console.log("Default Columns:", defaultColumns);
  console.log("Visible Columns:", visibleColumns);
  console.log("Displayed Columns:", displayedColumns);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (apiUrlAdvAcc) {
      const fetchSavedColumns = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${apiUrlAdvAcc}/GetCampaignColumns`, {
            params: { workspaceId },
          });

          if (response.data.status === "Success") {
            const savedColumns = JSON.parse(response.data.columns);

            // Ensure valid saved columns; fallback to empty array if null
            setVisibleColumns(savedColumns && savedColumns.length > 0 ? savedColumns : []);

           // setLoading(false);
          } else {
            setVisibleColumns([]); // Fallback to empty array
            //setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching column preferences:", error);
          setVisibleColumns([]); // Fallback to empty array
          //setLoading(false);
        } finally {
          setLoading(false);
        }
      };

      fetchSavedColumns();
    }
  }, [workspaceId, apiUrlAdvAcc]);

  const saveColumns = async (columns: string[]) => {
    try {
      const payload = {
        WorkspaceId: workspaceId,
        Columns: JSON.stringify(columns),
      };

      const response = await axios.post(`${apiUrlAdvAcc}/UpsertCampaignColumns`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.status === "Success") {
        console.log("Columns updated successfully.");
      } else {
        console.error("Failed to update columns:", response.data.status_Description);
      }
    } catch (error) {
      console.error("Error updating columns:", error);
    }
  };

  const handleSelectAll = () => {
    const allSelected = visibleColumns.length === extraColumns.length;
    const newColumns = allSelected ? [] : extraColumns.map((option) => option.value);
    setVisibleColumns(newColumns);
    saveColumns(newColumns);
  };

  const handleClear = () => {
    setVisibleColumns([]);
    saveColumns([]);
  };

  const handleChange = (option: string) => {
    const newColumns = visibleColumns.includes(option)
      ? visibleColumns.filter((col) => col !== option)
      : [...visibleColumns, option];
    setVisibleColumns(newColumns);
    saveColumns(newColumns);
  };

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div className="relative w-full">
      <Button
        variant="outline"
        className="w-32 mb-6 ml-4 text-[#020617] flex items-center"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        <FiFilter className="mr-2 text-[#020617]" /> Filter
      </Button>

      {isDropdownOpen && (
        <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className="w-64 -mt-6 mr-28 bg-white border border-gray-300 rounded shadow-lg z-10 p-4">
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem onSelect={handleSelectAll} className="cursor-pointer flex items-center">
                    <div
                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                        visibleColumns.length === extraColumns.length ? "bg-primary text-primary-foreground" : "border-gray-300"
                      }`}
                    >
                      {visibleColumns.length === extraColumns.length && <CheckIcon className="h-4 w-4" />}
                    </div>
                    <span>
                      {visibleColumns.length === extraColumns.length ? "Deselect All" : "Select All"}
                    </span>
                  </CommandItem>
                  {extraColumns.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleChange(option.value)}
                      className="cursor-pointer flex items-center"
                    >
                      <div
                        className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                          visibleColumns.includes(option.value) ? "bg-primary text-primary-foreground" : "border-gray-300"
                        }`}
                      >
                        {visibleColumns.includes(option.value) && <CheckIcon className="h-4 w-4" />}
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="mt-2 flex justify-between gap-2">
              <Button variant="ghost" className="text-sm hover:bg-gray-200 border mt-2" onClick={handleClear}>
                Clear
              </Button>
              <Button variant="ghost" className="text-sm hover:bg-gray-200 border mt-2" onClick={() => setIsDropdownOpen(false)}>
                Close
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};


export default DropdownMenuDemo;
