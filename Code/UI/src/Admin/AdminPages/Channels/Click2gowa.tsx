import React from "react";
import { Card, CardHeader, CardContent } from "../../../Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../Components/ui/table"; // Assuming you're using ShadCN table components

const Click2GOWA: React.FC = () => {
    return (
        <div>
            <Card className="mb-[20px] mt-2">
                <CardHeader>
                    <div>
                        <h2 className="text-lg font-bold text-left">Click2Go-WA Configuration</h2>
                        <p className="text-sm text-gray-600 text-left">
                            Here is the Click2Go WhatsApp Configurations
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <div className="max-h-[60vh] overflow-y-auto">
                            <Table className="rounded-xl border-[#020202] whitespace-nowrap">
                                <TableHeader className="text-center text-[14px] font-medium ">
                                    <TableRow className="sticky top-0 bg-white z-10 bg-gray-50">
                                        <TableHead>
                                            <div className="flex items-center gap-6 justify-start">
                                                <span className="font-medium text-[14px] text-[#64748B] pl-2 cursor-pointer">
                                                    WabaId
                                                </span>
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2 justify-start">
                                                <span className="font-medium text-[14px] text-[#64748B] cursor-pointer">
                                                    PhoneId
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
                                    <TableRow>
                                        <TableCell className="py-4">
                                            <span className="pl-2">1371362740532635</span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span>595043893689918</span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span>Connected</span>
                                        </TableCell>

                                    </TableRow>
                                </TableBody>

                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>





        </div>
    );
};

export default Click2GOWA;
