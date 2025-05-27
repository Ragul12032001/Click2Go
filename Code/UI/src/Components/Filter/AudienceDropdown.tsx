import React, { FC, useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { FiFilter } from "react-icons/fi";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

type MainFilterOption = "None" | "Status" | "UpdatedAt";
type SubFilterOption = string;

const DropdownMenuDemo: FC<{
  setFilterData: React.Dispatch<
    React.SetStateAction<{ filter: string; value: string }>
  >;
  filterData: { filter: string; value: string };
  dateList: string[];
}> = ({ setFilterData, filterData, dateList }) => {
  const [selectedMainFilter, setSelectedMainFilter] = useState<MainFilterOption>("None");
  const [selectedSubFilter, setSelectedSubFilter] = useState<SubFilterOption>("");
  const [isOpen, setIsOpen] = useState(false); // Manage dropdown state

  useEffect(() => {
    setSelectedMainFilter(filterData.filter as MainFilterOption);
    setSelectedSubFilter(filterData.value);
  }, [filterData]);

  // Handle Main Filter Selection
  const handleMainFilterChange = (filter: MainFilterOption) => {
    setSelectedMainFilter(filter);
    setSelectedSubFilter(""); 
    setIsOpen(true); // Keep dropdown open

    if (filter === "Status") {
      setFilterData({ filter, value: "Updated" });
    } else if (filter === "UpdatedAt") {
      setFilterData({ filter, value: dateList[0] || "" });
    } else {
      setFilterData({ filter: "None", value: "" });
    }
  };

  // Handle Subfilter Selection
  const handleSubFilterChange = (value: SubFilterOption) => {
    setSelectedSubFilter(value);
    setFilterData({ filter: selectedMainFilter, value });
    setIsOpen(true); // Keep dropdown open
  };

  return (
<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="w-full mb-6 ml-4 mt-[-6] text-[#020617] font-medium text-[14px] py-2 px-3">
      <FiFilter style={{ width: "14px", height: "14px" }} className="mr-1 text-[#020617]" /> Filter
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent className="w-64 p-3 rounded-md shadow-md space-y-4 -mt-10 mr-52">
    {/* Criteria */}
    <div className="flex w-full">
      <div className="basis-1/3 flex justify-center items-center">
        <Label className="text-sm text-[#020617]">Criteria</Label>
      </div>
      <div className="basis-2/3 flex justify-center items-center">
        <Select
          value={selectedMainFilter}
          onValueChange={(value) => handleMainFilterChange(value as MainFilterOption)}
        >
          <SelectTrigger className="text-gray-500 w-full h-8">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UpdatedAt" className="cursor-pointer">UpdatedAt</SelectItem>
            <SelectItem value="None" className="cursor-pointer">None</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Subfilter */}
    {selectedMainFilter === "UpdatedAt" && (
      <div className="flex w-full">
        <div className="basis-1/3 flex justify-center items-center">
          <Label className="text-sm text-[#020617]">Subfilter</Label>
        </div>
        <div className="basis-2/3 flex justify-center items-center">
          <Select
            value={selectedSubFilter}
            onValueChange={(value) => handleSubFilterChange(value as SubFilterOption)}
          >
            <SelectTrigger className="text-gray-500 w-full h-8">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="max-h-44">
              {dateList.map((date) => (
                <SelectItem key={date} value={date} className="cursor-pointer">
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )}
  </DropdownMenuContent>
</DropdownMenu>

  );
};

export default DropdownMenuDemo;
