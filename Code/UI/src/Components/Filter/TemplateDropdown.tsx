import React, { FC, useState, useEffect } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { FiFilter } from "react-icons/fi";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { useSelector } from "react-redux";
import { RootState } from "@/src/State/store";

interface Channel {
  channel_id: number;
  channel_name: string;
}

type MainFilterOption = "None" | "Type" | "Status" | "Last Edited";
type SubFilterOption = string;

const TemplateDropdownMenuDemo: FC<{
  setFilterData: React.Dispatch<
    React.SetStateAction<{ filter: string; value: string }>
  >;
  filterData: { filter: string; value: string };
  dateList: string[];
}> = ({ setFilterData, filterData, dateList }) => {
  const [selectedFilter, setSelectedFilter] =
    useState<MainFilterOption>("None");
  const [selectedSubFilter, setSelectedSubFilter] =
    useState<SubFilterOption>("");
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const apiUrlAdvAcc = useSelector(
    (state: RootState) => state.authentication.apiURL
  );

  useEffect(() => {
    setSelectedFilter(filterData.filter as MainFilterOption);
    setSelectedSubFilter(filterData.value);
  }, [filterData]);

  useEffect(() => {
    const fetchChannelList = async () => {
      try {
        const response = await axios.get(`${apiUrlAdvAcc}/GetChannelList`);
        setChannelList(response.data.channelList);
      } catch (error) {
        console.error("Error fetching channel list:", error);
      }
    };
    fetchChannelList();
  }, []);

  const handleMainFilterChange = (filter: MainFilterOption) => {
    setSelectedFilter(filter);
    setSelectedSubFilter("");
    setIsOpen(true); // Keep dropdown open

    if (filter === "Status") {
      setFilterData({ filter, value: "" });
    } else if (filter === "Type") {
      setFilterData({ filter, value: "" });
    } else if (filter === "Last Edited") {
      setFilterData({ filter, value: dateList[0] || "" });
    } else {
      setFilterData({ filter: "None", value: "" });
    }
  };

  const handleSubFilterChange = (value: string) => {
    setSelectedSubFilter(value);
    setFilterData({ filter: selectedFilter, value: value });
    setIsOpen(true);
  };

  return (
<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
  <DropdownMenuTrigger asChild>
    <Button
      variant="outline"
      className="w-full mb-6 ml-4 mt-[-6] text-[#020617] font-medium text-[14px] py-2 px-3"
    >
      <FiFilter
        style={{ width: "14px", height: "14px" }}
        className="mr-1 text-[#020617]"
      />
      Filter
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent className="w-64 p-3 rounded-md shadow-md space-y-4 -mt-12 mr-[105px]">
    {/* Criteria */}
    <div className="flex w-full">
      <div className="basis-1/3 flex justify-center items-center">
        <Label className="text-sm text-[#020617]">Criteria</Label>
      </div>
      <div className="basis-2/3 flex justify-center items-center">
        <Select
          value={selectedFilter}
          onValueChange={(value) => handleMainFilterChange(value as MainFilterOption)}
        >
          <SelectTrigger className=" text-gray-500 w-full h-8">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="cursor-pointer" value="Type">Type</SelectItem>
            <SelectItem className="cursor-pointer" value="Status">Status</SelectItem>
            <SelectItem className="cursor-pointer" value="Last Edited">Last Edited</SelectItem>
            <SelectItem className="cursor-pointer" value="None">None</SelectItem>
          </SelectContent>
        </Select>
      </div>
   
    </div>

    {/* Subfilter */}
    {selectedFilter !== "None" && (
    <div className="flex w-full">
      <div className="basis-1/3 flex justify-center items-center">
        <Label className="text-sm text-[#020617]">Subfilter</Label>
      </div>
      <div className="basis-2/3 flex justify-center items-center">
        <Select
            value={selectedSubFilter}
            onValueChange={handleSubFilterChange}
          >
            <SelectTrigger className="text-gray-500 w-full h-8">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {selectedFilter === "Type" &&
                channelList.map((channel) => (
                  <SelectItem className="cursor-pointer" key={channel.channel_id} value={channel.channel_name}>
                    {channel.channel_name}
                  </SelectItem>
                ))}
              {selectedFilter === "Status" && (
                <>
                  <SelectItem className="cursor-pointer" value="APPROVED">APPROVED</SelectItem>
                  <SelectItem className="cursor-pointer" value="PENDING">PENDING</SelectItem>
                  <SelectItem className="cursor-pointer" value="REJECTED">REJECTED</SelectItem>
                </>
              )}
              {selectedFilter === "Last Edited" &&
                dateList.map((date) => (
                  <SelectItem className="cursor-pointer" key={date} value={date}>
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

export default TemplateDropdownMenuDemo;
