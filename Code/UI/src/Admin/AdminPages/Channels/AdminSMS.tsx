import React, { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  Card,
  CardContent,
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
  sms_template_id: string;
  sender_id: string;
  status: string;
  last_updated: string;
}

const AdminSMS: FC = () => {
  const location = useLocation();
  const selectedLabel = location.state?.selectedLabel;

  const adminUrl = useSelector((state: RootState) => state.authentication.adminUrl);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [connectionList, setConnectionList] = useState<ConnectionList[] | null>(null); // Start with null state

  useEffect(() => {
    console.log("selectedLabel from navigation state:", selectedLabel);
  }, [selectedLabel]);

  const getConnectionList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${adminUrl}/Getapprovedsmslist`);
      if (response.data.status === "Success") {
        setConnectionList(response.data.smslist);
      } else {
        console.error("List of connections not found");
        setConnectionList([]); // In case of empty response
      }
    } catch (error) {
      console.error("Error getting connection list: ", error);
      setConnectionList([]); // In case of error
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getConnectionList();
  }, [adminUrl]);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <CircularProgress color="success" />
        </div>
      ) : connectionList === null ? (
        <div className="flex items-center justify-center h-screen">
          <CircularProgress color="success" />
        </div>
      ) : connectionList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <h2 className="text-[24px] font-bold mb-1 text-[#000000]">
            No SMS connections have been established by advertisers
          </h2>
          <div>
            <p className="text-[#64748B] font-normal mb-1 text-[14px]">
              SMS connections added by advertisers will be displayed here once they are successfully established.
            </p>
          </div>
        </div>
      ) : (
        <div>
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
                      <TableRow className="sticky top-0 bg-white z-10 bg-gray-50">
                        <TableHead>
                          <div className="flex items-center gap-6 justify-start">
                            <span className="font-medium text-[14px] text-[#64748B] pl-2 cursor-pointer">
                              Template Id
                            </span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2 justify-start">
                            <span className="font-medium text-[14px] text-[#64748B] cursor-pointer">
                              Sender Id
                            </span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[14px] text-[#64748B] cursor-pointer">
                              Status
                            </span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                      {connectionList.map((connection) => (
                        <TableRow key={connection.sms_template_id}>
                          <TableCell className="py-4">
                            <span className="pl-2">{connection.sms_template_id}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span>{connection.sender_id}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span>{connection.status}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AdminSMS;
