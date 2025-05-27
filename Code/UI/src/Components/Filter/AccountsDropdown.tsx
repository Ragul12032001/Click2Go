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
import { CaretSortIcon } from "@radix-ui/react-icons";




interface Channel {
  channel_id: number;
  channel_name: string;
}

type FilterOption = 'All Accounts' | 'Advertiser' | 'Personal';


const DropdownMenuDemo: FC<{
  setFilterData: React.Dispatch<
    React.SetStateAction<{ filter: string;  value: number }>
  >;
}> = ({ setFilterData }) => {
  const navigate = useNavigate();

  // const [selectedFilter, setSelectedFilter] = useState<string>("none");
  // const [isDropdownOpen, setDropdownOpen] = useState(false); // Track dropdown open state

  const [selectedOption, setSelectedOption] = useState<FilterOption>('All Accounts');


  const handleSelectChange = (value: FilterOption) => {
    setSelectedOption(value); // Update the dropdown UI state
    setFilterData({ filter: value, value: 0 }); // Update the parent state
  };


  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-50 mb-6 ml-4 mt-[-6] text-[#020617]">
            <span className="mr-2 text-[#020617]">  {selectedOption} </span>
            <CaretSortIcon className="cursor-pointer" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="cursor-pointer w-48 h-auto">
          <DropdownMenuItem onSelect={() => handleSelectChange('All Accounts')} className="cursor-pointer h-8">
            All Accounts
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelectChange('Advertiser')} className="cursor-pointer h-8">
            Advertiser
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSelectChange('Personal')} className="cursor-pointer h-8">
            Personal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DropdownMenuDemo;
