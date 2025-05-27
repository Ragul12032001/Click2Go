import React, { FC, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../Components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../Components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../Components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Components/ui/table";
import { useToast } from "../../../Components/ui/use-toast";
import { Toaster } from "../../../Components/ui/toaster";
import { Button } from "../../../Components/ui/button";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../State/store";
import { setSMPPStatus } from "../../../State/slices/SmsSlice";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { CircularProgress } from "@mui/material";

interface ConnectSMSProps {
  open: boolean;
  handleClose: () => void;
  checkIsAlive: (channelId: number) => Promise<boolean>;
  connectionList: ConnectionList[] | undefined;
}

interface ConnectionList {
  id: number;
  workspaceName: string;
  wabaId: string;
  phoneId: string;
  created_date: string;
  last_updated: string;
}

const AdminWhatsapp: FC = () => {
  const adminUrl = useSelector((state: RootState) => state.authentication.adminUrl);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);

  const [connectionList, setConnectionList] = useState<ConnectionList[]>();

  const dispatch = useDispatch();

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const getConnectionList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${adminUrl}/GetWhatsappNumbers`);
      if (response.data.status === "Success") {
        setConnectionList(response.data.phoneNumberData);
        console.log(connectionList, 16, 2);
        setIsLoading(false);
      } else {
        console.error("List of connections not found");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("error getting connection list: ", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getConnectionList();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
        </div>
      ) : (
        <div>
          {connectionList != null ? (
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                <Table className="rounded-xl border-[#020202]">
                  <TableHeader className="text-center text-[14px] font-medium">
                    <TableRow className="sticky top-0 bg-white z-10 bg-gray-50">
                      {" "}
                      {/* Sticky header */}
                      <TableHead>
                        <div className="flex items-center gap-6 justify-start cursor-pointer">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Workspace Name{" "}
                          </span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2 justify-start">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Waba Id{" "}
                          </span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2 ">
                          <span className="font-medium text-[14px] text-[#64748B]">
                            Phone Id{" "}
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

                    </TableRow>
                  </TableHeader>

                  <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                    {connectionList?.map((connection) => {
                      return (
                        <TableRow key={connection.id}>
                          <TableCell className="flex justify-start py-4 text-green-900">
                            <div className="flex items-center gap-6">
                              <span
                                style={{
                                  color: "#020617",
                                  fontSize: "14px",
                                  fontWeight: "400",
                                }}
                              >
                                {connection.workspaceName}
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
                              {connection.wabaId}
                            </span>
                          </TableCell>

                          <TableCell className="py-4">
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {connection.phoneId}
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
                                {new Date(
                                  connection.created_date
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}{" "}
                                ∙{" "}
                                {new Date(
                                  connection.created_date
                                ).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
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
                                  connection.last_updated
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}{" "}
                                ∙{" "}
                                {new Date(
                                  connection.last_updated
                                ).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <>
              {!isLoading && (
                <div className="flex flex-col items-center justify-center h-[500px]">
                  <h2 className="text-[24px] font-bold mb-1 text-[#000000]">
                    No WhatsApp numbers connected by advertisers
                  </h2>
                  <div>
                    <p className="text-[#64748B] font-normal mb-1 text-[14px]">
                      WhatsApp numbers added by advertisers will appear here once connected.
                    </p>
                  </div>
                </div>
              )}
            </>

          )}
        </div>
      )}
    </>
  );
};
export default AdminWhatsapp;
