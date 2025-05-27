import React, { FC, useState } from "react";
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
type SubFilterOption = "Updated" | "Syncing" | "";

const DropdownMenuDemo: FC<{
  setFilterData: React.Dispatch<
    React.SetStateAction<{ filter: string; value: string }>
  >;
  dateList: string[];
}> = ({ setFilterData, dateList }) => {
  const [selectedMainFilter, setSelectedMainFilter] =
    useState<MainFilterOption>("None");
  const [selectedSubFilter, setSelectedSubFilter] =
    useState<SubFilterOption>("");

  // Handle Main Filter Selection
  const handleMainFilterChange = (filter: MainFilterOption) => {
    setSelectedMainFilter(filter);

    // Reset Subfilter based on Main Filter
    if (filter === "Status") {
      setSelectedSubFilter("Updated"); // Default to "Updated"
      setFilterData({ filter, value: "Updated" });
    } else if (filter === "UpdatedAt") {
      setSelectedSubFilter(""); // Empty for UpdatedAt
      setFilterData({ filter, value: "" });
    } else {
      // None (No filter)
      setSelectedSubFilter("");
      setFilterData({ filter: "None", value: "" });
    }
  };

  // Handle Subfilter Selection
  const handleSubFilterChange = (value: SubFilterOption) => {
    setSelectedSubFilter(value);
    setFilterData({ filter: selectedMainFilter, value });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" 
        className="w-full mb-6 ml-4 mt-[-6] text-[#020617] font-medium text-[14px] py-2 px-3">
          <FiFilter style={{width:'14px' , height:'14px' }} className="mr-1 text-[#020617]" /> Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 transform -translate-x-32 mt-[-60px] ml-[-160px]">
        <DropdownMenuGroup>
          {/* Main Filter Dropdown */}
          <DropdownMenuItem>
            <Label className="mr-6">Criteria</Label>
            <Select onValueChange={(value) => handleMainFilterChange(value as MainFilterOption)}>
              <SelectTrigger className="text-gray-500 w-32 h-8">
                <SelectValue className="text-gray-500" placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Status">Status</SelectItem>
                <SelectItem value="UpdatedAt">UpdatedAt</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Subfilter Dropdown */}
        {selectedMainFilter !== "None" && (
          <DropdownMenuGroup>
            <DropdownMenuItem className="items-start">
              <Label className="mr-6 pt-2">Subfilter</Label>
              {selectedMainFilter === "Status" && (
                <Select onValueChange={(value) => handleSubFilterChange(value as SubFilterOption)}>
                  <SelectTrigger className="text-gray-500 w-2/3 h-8">
                    <SelectValue
                      className="text-gray-500"
                      placeholder="Select status"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Updated">Updated</SelectItem>
                    <SelectItem value="Syncing...">Syncing</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {selectedMainFilter === "UpdatedAt" && (
                <Select onValueChange={(value) => handleSubFilterChange(value as SubFilterOption)}>
                  <SelectTrigger className="text-gray-500 w-2/3 h-8">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                 <SelectContent>
                    {dateList.map((date) => (
                      <SelectItem key={date} value={date}>
                        {date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownMenuDemo;
