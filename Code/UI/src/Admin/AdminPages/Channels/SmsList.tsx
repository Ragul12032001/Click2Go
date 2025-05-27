import React, { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../Components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Components/ui/table";
import { useToast } from "../../../Components/ui/use-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../State/store";

import { CircularProgress } from "@mui/material";

interface ConnectionList {
  sms_template_id:string;
  sender_id:string;
  status:string;
  last_updated:string;
}

const SmsList: FC = () => {
const location = useLocation();
const selectedLabel = location.state?.selectedLabel;

  const adminUrl = useSelector((state: RootState) => state.authentication.adminUrl);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [connectionList, setConnectionList] = useState<ConnectionList[]>();
  
  useEffect(() => {
    console.log("selectedLabel from navigation state:", selectedLabel);
  }, [selectedLabel]);
  
  
 

  const getConnectionList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${adminUrl}/Getapprovedsmslist`);
      if (response.data.status === "Success") {
        setConnectionList(response.data.smslist);
        console.log('smslist',connectionList)
      } else {
        console.error("List of connections not found");
      }
    } catch (error) {
      console.error("error getting connection list: ", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    getConnectionList();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <CircularProgress color="success" />
        </div>
      ) : (
        <div>
          {connectionList != null ? (
           <Card className="mb-[20px] mt-2">
           <CardHeader>
             <div>
               <h2 className="text-lg font-bold text-left">Approved SMS Templates</h2>
               <p className="text-sm text-gray-600 text-left">
                 Here you can view your approved SMS templates
               </p>
             </div>
           </CardHeader>
           <CardContent>
             <div className="rounded-md border overflow-hidden">
               <div className="max-h-[60vh] overflow-y-auto">
                 <Table className="rounded-xl border-[#020202] whitespace-nowrap">
                   <TableHeader className="text-center text-[14px] font-medium">
                     <TableRow className="sticky top-0 bg-white z-10">
                       <TableHead>
                         <div className="flex items-center gap-6 justify-start cursor-pointer">
                           <span className="font-medium text-[14px] text-[#64748B]">
                             Template Id
                           </span>
                         </div>
                       </TableHead>
                       <TableHead>
                         <div className="flex items-center gap-2 justify-start">
                           <span className="font-medium text-[14px] text-[#64748B]">
                             Sender Id
                           </span>
                         </div>
                       </TableHead>
                       <TableHead>
                         <div className="flex items-center gap-2">
                           <span className="font-medium text-[14px] text-[#64748B]">
                             Status
                           </span>
                         </div>
                       </TableHead>
                       
                     </TableRow>
                   </TableHeader>
         
                   <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                     {connectionList?.length > 0 ? (
                       connectionList.map((connection) => (
                         <TableRow key={connection.sms_template_id}>
                           <TableCell className="py-4">
                             <span>{connection.sms_template_id}</span>
                           </TableCell>
                           <TableCell className="py-4">
                             <span>{connection.sender_id}</span>
                           </TableCell>
                           <TableCell className="py-4">
                             <span>{connection.status}</span>
                           </TableCell>
                          
                         </TableRow>
                       ))
                     ) : (
                       <TableRow>
                         <TableCell colSpan={4} className="text-center py-4">
                           No SMS templates found.
                         </TableCell>
                       </TableRow>
                     )}
                   </TableBody>
                 </Table>
               </div>
             </div>
           </CardContent>
         </Card>
         


  
          ) : (
            <div className="flex items-center justify-center h-screen">
              <p
                className=" text-sm font-thin h-[35px] mt-[10px] mb-[30px]"
              >
               Here you will see all Sms connection list
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default SmsList;
