import React, { FC, useState, useEffect } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiFilter } from "react-icons/fi";
import { Label } from "../ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

interface Channel {
  channel_id: number;
  channel_name: string;
}

type MainFilterOption = "None" | "Channel" |"Status" | "StartedAt";
type SubFilterOption = string;

const DropdownMenuDemo: FC<{
  setFilterData: React.Dispatch<
    React.SetStateAction<{ filter: string; subFilter: string; }>
  >;
  filterData: { filter: string; subFilter: string };
  dateList: string[];
}> = ({ setFilterData, filterData, dateList }) => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<MainFilterOption>("None");
  const [selectedSubFilter, setSelectedSubFilter] = useState<SubFilterOption>(""); // Track selected value
  const [value, setValue] = useState<number>(10);
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Track dropdown open state

  // Fetch config on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log("Date :" , dateList);
        const response = await fetch("/config.json");
        const config = await response.json();
        console.log("Config loaded:", config); // Debugging log
        setApiUrlAdvAcc(config.ApiUrlAdvAcc); // Set API URL from config
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []); // Runs only once on mount

  // Watch for apiUrlAdvAcc to change and fetch data
  
  useEffect(() => {
    const fetchData = async () => {
      if (apiUrlAdvAcc) {
        console.log("Fetching data for apiUrlAdvAcc:", apiUrlAdvAcc); // Debugging log
        try {
          await getChannelList(); // Load the channel list
          console.log("Data fetched successfully");
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.log("apiUrlAdvAcc is missing"); // Log to help debug
      }
    };

    fetchData();
  }, [apiUrlAdvAcc]);


  useEffect(() => {
      setSelectedFilter(filterData.filter as MainFilterOption);
      setSelectedSubFilter(filterData.subFilter);
  }, [filterData]);

  const getChannelList = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetChannelList`);
      if (response.data && response.data.channelList) {
        setChannelList(response.data.channelList);
        console.log("Channel List:", response.data.channelList);
        console.log("Date List: ", dateList);
      } else {
        console.log("No channel list available in response.");
      }
    } catch (error) {
      console.error("Error fetching channel list:", error);
    }
  };

  useEffect(() => {
    if (selectedFilter === "None") {
      setSelectedSubFilter(""); // Update state when selectedFilter is 'none'
    }
  }, [selectedFilter]);


  // Handle Main Filter Selection
  const handleMainFilterChange = (filter: MainFilterOption) => {
      setSelectedFilter(filter);
      setSelectedSubFilter(""); // Reset subfilter
  
      if (filter === "Status") {
        setFilterData({ filter, subFilter: "Updated" });
      } else if (filter === "StartedAt") {
        setFilterData({ filter, subFilter: dateList[0] || "" });
      } else if (filter === "Channel") {
        setFilterData({ filter, subFilter: channelList[0].channel_name || "" });
      } else {
        setFilterData({ filter: "None", subFilter: "" });
      }
  
  };

    // Handle Subfilter Selection
  const handleSubFilterChange = (value: SubFilterOption) => {
      setSelectedSubFilter(value);
      setFilterData({ filter: selectedFilter, subFilter: value });
  };


  return (
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="w-full mb-6 ml-4 mt-[-6] text-[#020617] font-medium text-[14px] py-2 px-3">
      <FiFilter style={{ width: "14px", height: "14px" }} className="mr-1 text-[#020617]" /> Filter
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-64 transform -translate-x-32 mt-[-60px] ml-[-160px]">
    <DropdownMenuGroup>
      {/* Main Filter Dropdown */}
      <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="flex items-center space-x-4">
        <Label className="w-20">Criteria</Label>
        <Select value={selectedFilter} onValueChange={(value) => handleMainFilterChange(value as MainFilterOption)}>
          <SelectTrigger className="text-gray-500 w-full h-8">
            <SelectValue className="text-gray-500" placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Channel" className="cursor-pointer">Channel</SelectItem>
            <SelectItem value="Status" className="cursor-pointer">Status</SelectItem>
            <SelectItem value="StartedAt" className="cursor-pointer">StartedAt</SelectItem>
            <SelectItem value="None" className="cursor-pointer">None</SelectItem>
          </SelectContent>
        </Select>
      </DropdownMenuItem>
    </DropdownMenuGroup>

    {/* Subfilter Dropdown */}
    {selectedFilter !== "None" && (
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="flex items-center space-x-4">
          <Label className="w-20">Subfilter</Label>
          {selectedFilter === "Channel" && (
            <Select value={selectedSubFilter} onValueChange={(value) => handleSubFilterChange(value as SubFilterOption)}>
              <SelectTrigger className="text-gray-500 w-full h-8">
                <SelectValue className="text-gray-500" placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                {channelList.map((channel) => (
                  <SelectItem key={channel.channel_name} value={channel.channel_name} className="cursor-pointer">
                    {channel.channel_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedFilter === "Status" && (
            <Select value={selectedSubFilter} onValueChange={(value) => handleSubFilterChange(value as SubFilterOption)}>
              <SelectTrigger className="text-gray-500 w-full h-8">
                <SelectValue className="text-gray-500" placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Live" className="cursor-pointer">Live</SelectItem>
                <SelectItem value="Pending" className="cursor-pointer">Pending</SelectItem>
                <SelectItem value="In review" className="cursor-pointer">In review</SelectItem>
                <SelectItem value="Paused" className="cursor-pointer">Paused</SelectItem>
                <SelectItem value="Completed" className="cursor-pointer">Completed</SelectItem>
              </SelectContent>
            </Select>
          )}

          {selectedFilter === "StartedAt" && (
            <Select value={selectedSubFilter} onValueChange={(value) => handleSubFilterChange(value as SubFilterOption)}>
              <SelectTrigger className="text-gray-500 w-full h-8">
                <SelectValue className="text-gray-500" placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {dateList.map((date) => (
                  <SelectItem key={date} value={date} className="cursor-pointer">
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
