import React, { ChangeEvent, FC, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../Components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Components/ui/select";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../Components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
import { useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import { Button } from "../../Components/ui/button";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { CircularProgress } from "@mui/material";
import { HandPlatter } from "lucide-react";
import { toast } from "react-toastify";
import { title } from "process";

interface PhoneNumberList {
  id: number;
  phone_name: string;
  phone_number: string;
  created_date: string;
  last_updated_date: string;
}

interface Country {
  country_id: number;
  country_code: number;
  country_name: string;
  country_shortname: string;
}

interface AddPhoneProps {
  open: boolean;
  handleClose: () => void;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  phone_Id: number;
  phone_Name: string;
  phone_Number: string;
  countryList: Country[];
  numberList: string[];
  // connectionList: PhoneNumberList[] | undefined;
}

export const AddPhone: FC<AddPhoneProps> = ({
  open,
  handleClose,
  isEdit,
  setIsEdit,
  phone_Id,
  phone_Name,
  phone_Number,
  countryList,
  numberList
  // Accept connection list as a prop
}) => {
  const advurl = useSelector((state: RootState) => state.authentication.apiURL);

  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );

  const [isloading , setisLoading] = useState(false);
  const [phoneName, setPhoneName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [editPhoneId, setEditPhoneId] = useState(0);
  const toast = useToast();
  const [PhoneNameError, setPhoneNameError] = useState<string | null>(null);
  const [PhoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState("+91(IN)");

  

 useEffect(() => {
    console.log("NUMBERS: ", numberList);
    if (!open) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
  }, [open]);

  

  const addPhoneNumber = async () => {
    if(PhoneNameError || PhoneNumberError){
      return null;
    }

    if(phoneName.length === 0 || phoneNumber.length === 0){
      setPhoneNumberError("Please fill all required fields");
      return false;
    }

    if(numberList.includes(phoneNumber)){
      setPhoneNumberError("Phone Number already in use.");
      return false;
    }

    setPhoneNameError("");
    setPhoneNumberError("");

    try {
      setisLoading(true);
      const response = await axios.post(`${advurl}/InsertSMSPhoneNumber`, {
        phoneName: phoneName,
        phoneNumber: phoneNumber,
        workspaceId: workspaceId,
      });
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Phone Number Added Successfully",
        });
        handleClose();
        setisLoading(false);
        setIsEdit(false);
      } else {
        setisLoading(false);
        toast.toast({
          title: "Error",
          description: "Phone number could not be inserted",
        });
      }
    } catch (error) {
      setisLoading(false);
      toast.toast({
        title: "Error",
        description: "Api Call Failed",
      });
      console.error("Api call failed for addPhoneNumber: ", error);
    }
  };

  const UpdatePhoneNumber = async (id: number) => {
    try {
      const response = await axios.put(`${advurl}/UpdateSMSPhoneNumber`, {
        phoneName: phoneName,
        phoneNumber: phoneNumber,
        id: id,
      });
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "Phone Number Updated Successfully",
        });
        handleClose();
        setIsEdit(false);
      } else {
        toast.toast({
          title: "Error",
          description: "Phone number could not be updated",
        });
      }
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Api Call Failed",
      });
      console.error("Api call failed for updatePhoneNumber: ", error);
    }
  };


  useEffect(() => {
    debugger;
    if (isEdit) {
      setEditPhoneId(phone_Id);
      setPhoneName(phone_Name);
      setPhoneNumber(phone_Number);
    }
    else{
      setEditPhoneId(0);
      setPhoneName("");
      setPhoneNumber("");
    }
  },[isEdit]);





  const validatePhoneName = (value: string): boolean => {
    const regex = /^(?![0-9_@ ])([a-zA-Z0-9 _@]*[a-zA-Z0-9])?$/;

    if (value.length === 0) {
      setPhoneNameError("Phone Name cannot be empty.");
      return false;
    }

    if (
      value.startsWith("_") ||
      value.startsWith("@") ||
      value.startsWith(" ")
    ) {
      setPhoneNameError("Phone Name cannot start with '_', '@', or a space.");
      return false;
    }

    if (value.endsWith("_") || value.endsWith("@") || value.endsWith(" ")) {
      setPhoneNameError("Phone Name cannot end with '_', '@', or a space.");
      return false;
    }

    if (/^[0-9]/.test(value)) {
      setPhoneNameError("Phone Name cannot start with a number.");
      return false;
    }

    if (!regex.test(value)) {
      setPhoneNameError(
        "Phone Name contains invalid characters or invalid placement."
      );
      return false;
    }

    setPhoneName(value);
    setPhoneNameError(null);
    return true;
  };

  const validatePhoneNumber = (value: string): boolean => {
    if (value.length === 0) {
      setPhoneNumberError("Phone Number cannot be empty.");
      return false;
    }

    // const number = selectedCode + value.toString();
    const number = value.toString();
    console.log("NUMBER :", number );
    setPhoneNumber(value.toString());


    setPhoneNumberError("");

    return true;

  }


  const handlePhoneNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
      if (validatePhoneName(value)) {
        console.log("Phone Name is correct");
      } else {
        console.log("Phone Name is incorrect");
      }
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
      if (validatePhoneNumber(value)) {
        console.log("Phone Name is correct");
      } else {
        console.log("Phone Name is incorrect");
      }
  };


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <Toaster />
      <DialogContent className="overflow-y-auto max-h-screen ">
        <DialogHeader>
          <DialogTitle className="font-semibold text-[#09090B] text-[18px]">
            {isEdit ? "Edit SMS Phone Number" : "Add SMS Phone Number"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-[6px]">
          <Label
            htmlFor="sender-name"
            className="text-14px font-medium text-[#020617]"
          >
            Sender Name
          </Label>
          <Input
            id="phone-name"
            required
            value={phoneName}
            placeholder="Add your phone name..."
            onChange={handlePhoneNameChange}
            className="text-[14px] font-normal placeholder:text-[#64748B]"
          />
          {PhoneNameError && (
            <p className="text-red-500 text-sm">{PhoneNameError}</p>
          )}
 
        </div>

        <div className="flex flex-col gap-[6px]">
          <Label
            htmlFor="short-code"
            className="text-14px font-medium text-[#020617]"
          >
            Short Code
          </Label>

          <div className="flex items-center gap-2">
          {/* <Select
            onValueChange={(value) => {
            console.log("Raw Value from Dropdown:", value); // Log the raw value
            setSelectedCode(value); // Update state
          }}
          >
          <SelectTrigger className="w-[130px] border-gray-200 relative">
            <SelectValue placeholder={selectedCode} />
          </SelectTrigger>
            
            <SelectContent className="absolute z-50 top-full max-h-60 overflow-auto">
            {countryList.map((country) => (
              <SelectItem
                className="cursor-pointer"
                key={country.country_code}
                value={`+${country.country_code}`} // Ensure + is stored in the value
              >
                
                <div className="flex items-center w-full">
                  <span>+{country.country_code} ({country.country_shortname})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
 
            {/* Phone Number Input */}
            <Input
              id="short-code"
              required
              placeholder="Add your short code here..."
              onChange={(handlePhoneNumberChange)}
              className="text-[14px] font-normal placeholder:text-[#64748B] flex-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance]:textfield"
            />

          </div>
          {/* Hidden Field for Saving */}
          {/* <input type="hidden" name="fullPhoneNumber" value={`+${selectedCode}${phoneNumber}`} /> */}

          {PhoneNumberError && (
            <p className="text-red-500 text-sm">{PhoneNumberError}</p>
          )}

        </div>

        <div className="mb-4 flex justify-center w-full">
          <Button
            disabled={isloading}
            className="w-full"
            onClick={() => {
              if (isEdit) {
                UpdatePhoneNumber(phone_Id);
              }
              else{
                addPhoneNumber();
              }
            }}
          >
            {isloading?"Processing...":isEdit?"Edit Phone Number":"Add Phone Number"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SMS: FC = () => {
  const [phoneNumberList, setPhoneNumberList] = useState<PhoneNumberList[]>();
  const [numberList, setNumberList] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editPhoneName, setEditPhoneName] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [editPhoneId, setEditPhoneId] = useState(0);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const advurl = useSelector((state: RootState) => state.authentication.apiURL);
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const toast = useToast();
  useEffect(() => {

    getPhoneNumbers();
    getCountryList();
  },[]);


  const getCountryList = async () => {
    try {
      const response = await axios.get(`${advurl}/GetCountryDetails`);

      // Assuming the response data contains a 'CountryList' field as discussed earlier
      if (response.data && response.data.countryDetails) {
        setCountryList(response.data.countryDetails);
        console.log("Country List : ", response.data.countryDetails);
      } else {
        console.log("No Country list available in response.");
      }
    } catch (error) {
      // Handle error if API call fails

      console.error("Error fetching Country list:", error);
    } finally {
    }
  };

  const getPhoneNumbers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${advurl}/GetSmsPhoneNumbers?workspace_id=${workspaceId}`
      );
      if (response.data.status === "Success") {
        console.log("Phone number retrieved successfully");
        setPhoneNumberList(response.data.phoneNumberList);
        const numbers = response.data.phoneNumberList.map(
          (item: { phone_number: string }) => item.phone_number
        );
        setNumberList(numbers);
        setIsLoading(false);
      } else {
        console.error(
          "phone number retrieval failed or no phone number exists"
        );
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("api error in fetching phone numbers");
    }
  };

  const deletePhoneNumber = async (id: number, name: string) => {
    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${advurl}/DeleteSMSPhoneNumber?id=${id}`
      );
      if (response.data.status === "Success") {
        console.log("phone number deleted successfully");
        toast.toast({
          title: "Success",
          description: `${name} deleted successfully`,
        });
        getPhoneNumbers();
      } else {
        console.error("phone number could not be deleted");
        toast.toast({
          title: "Error",
          description: `${name} could not be deleted`,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error(
        "phone number could not be deleted due to api failure: ",
        error
      );
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    getPhoneNumbers();
    setOpen(false);
    setIsEdit(false);
    setEditData(0, "", "");
  };
  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const setEditData = (id: number, name: string, number: string) => {
    setEditPhoneId(id);
    setEditPhoneName(name);
    setEditPhoneNumber(number);
  };
  

  return (
    <>
    {isLoading?  
    (<div className="flex items-center justify-center h-screen">
          <CircularProgress color="success" />
            </div>):(<>
              <div>
        <Toaster />
        <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4">
          <Button
            onClick={() => {
              handleOpen();
            }}
            className="w-36 text-sm font-thin h-[35px] mt-[10px] mb-[30px] form-button"
          >
            Add Number
          </Button>
        </div>
        <div>
          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table className="rounded-xl border-[#020202]">
                <TableHeader className="text-center text-[14px] font-medium">
                  <TableRow className="sticky top-0 bg-white z-10">
                    {" "}
                    {/* Sticky header */}
                    <TableHead>
                      <div className="flex items-center gap-6 justify-start cursor-pointer ml-1">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Phone Name
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2 justify-start">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Phone Number{" "}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2 ">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Created Date{" "}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2 ">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Last Updated{" "}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                  {phoneNumberList?.map((phone) => {
                    return (
                      <TableRow key={phone.id}>
                        <TableCell className="flex justify-start py-4 text-green-900 ml-1">
                          <div className="flex items-center gap-6">
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {phone.phone_name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {phone.phone_number}
                          </span>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex gap-2">
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {new Date(phone.created_date).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}{" "}
                              ∙{" "}
                              {new Date(phone.created_date).toLocaleTimeString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex gap-2">
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {new Date(
                                phone.last_updated_date
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}{" "}
                              ∙{" "}
                              {new Date(
                                phone.last_updated_date
                              ).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 ">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <DotsHorizontalIcon
                                onClick={() => handleMenuToggle(phone.id)}
                                className="cursor-pointer w-6 h-6"
                              />
                            </DropdownMenuTrigger>
                            {openMenuRowId === phone.id && (
                              <DropdownMenuContent
                                align="end"
                                className="w-20"
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setIsEdit(true);
                                    setEditData(
                                      phone.id,
                                      phone.phone_name,
                                      phone.phone_number
                                    );
                                    handleOpen();
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => {
                                    deletePhoneNumber(
                                      phone.id,
                                      phone.phone_name
                                    );
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            )}
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      <AddPhone
        open={open}
        handleClose={handleClose}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        phone_Id={isEdit ? editPhoneId : 0}
        phone_Name={isEdit ? editPhoneName : ""}
        phone_Number={isEdit ? editPhoneNumber : ""}
        countryList={countryList}
        numberList={numberList}
      />
            
      </>)
    
  }

    </>
  );
};

export default SMS;
