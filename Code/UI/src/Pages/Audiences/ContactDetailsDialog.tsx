import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../Components/ui/dialog";
import { Button } from "../../Components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../Components/ui/card";
import axios from "axios";

interface ContactDetailsDialogProps {
  list_id: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  successCount: number;
  failureCount: number;
  apiEndpoint: string;
}

interface Contact {
  firstName: string;
  lastName: string;
  phoneNo: string;
  location: string;
  errorMessage: string;
}

const ContactDetailsDialog: React.FC<ContactDetailsDialogProps> = ({
  open,
  onOpenChange,
  successCount,
  apiEndpoint,
  list_id,
}) => {
  const [showFailedContacts, setShowFailedContacts] = useState(false);
  const [failedContacts, setFailedContacts] = useState<Contact[]>([]);
  const [failureCount, setFailureCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFailedContacts = async () => {
      if (open && list_id) {
        setLoading(true);
        setError("");

        try {
          const response = await axios.get(
            `${apiEndpoint}/GetFailedAudienceList?listId=${list_id}`
          );

          if (response.data.status === "Success") {
            setFailedContacts(response.data.failedAudienceList);
            setFailureCount(response.data.recordCount);
          } else {
            setFailedContacts([]);
            setFailureCount(0);
            setError(
              response.data.Status_Description || "No failed contacts found."
            );
          }
        } catch (err) {
          console.error("Failed to fetch contacts:", err);
          setError("An error occurred while fetching failed contacts.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFailedContacts();
  }, [open, list_id, apiEndpoint]);

  useEffect(() => {
    if (!open) {
      setShowFailedContacts(false);
      // Restore pointer events after a short delay
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`p-6 mx-auto transition-all ${
          showFailedContacts ? "max-w-4xl" : "max-w-lg"
        }`}
        onPointerDownOutside={handleClose}
        onEscapeKeyDown={handleClose}
      >
        <DialogHeader>
          <DialogTitle className="text-18px font-semibold text-[#09090B]">
            Contact Details
          </DialogTitle>
          <DialogDescription className="text-14px font-medium text-[#71717A] mt-2">
            Overview of contact upload results.
          </DialogDescription>
        </DialogHeader>

        {/* Success and Failure Cards */}
        <div className="grid grid-cols-2 gap-4 -mt-2">
          {/* Success Card */}
          <Card className="bg-blue-50 border border-green-300 shadow-sm">
            <CardHeader className="py-1">
              <CardTitle className="text-green-800 text-sm">
                No.of Contacts Uploaded Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-1">
              <p className="text-2xl font-bold text-green-800">{successCount}</p>
            </CardContent>
          </Card>

          {/* Failure Card */}
          <Card className="bg-red-50 border border-red-300 shadow-sm">
            <CardHeader className="py-1">
              <CardTitle className="text-red-800 text-sm">
                No.of Contacts Failed to Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-1">
              <p className="text-2xl font-bold text-red-800">{failureCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Show/Hide Failed Contacts Link */}
        {failureCount > 0 && (
          <div className="flex justify-start gap-2 -mt-2">
            <a
              href="#"
              className="text-sm text-green-500 hover:underline cursor-pointer"
              onClick={() => setShowFailedContacts(!showFailedContacts)}
            >
              {showFailedContacts
                ? "Hide Failed Contacts"
                : "Show Failed Contacts"}
            </a>
          </div>
        )}

        {/* Failed Contacts Table (Shown when clicked) */}
        {showFailedContacts && (
          <div className="overflow-auto max-h-40 -mt-2 border rounded-lg">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Firstname</th>
                  <th className="border p-2">Lastname</th>
                  <th className="border p-2">Phoneno</th>
                  <th className="border p-2">Location</th>
                  <th className="border p-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {failedContacts.map((contact, index) => (
                  <tr key={index} className="odd:bg-white even:bg-gray-50">
                    <td className="border p-2 whitespace-nowrap">
                      {contact.firstName}
                    </td>
                    <td className="border p-2 whitespace-nowrap">
                      {contact.lastName}
                    </td>
                    <td className="border p-2 whitespace-nowrap">
                      {contact.phoneNo}
                    </td>
                    <td className="border p-2 whitespace-nowrap">
                      {contact.location}
                    </td>
                    <td className="border p-2 whitespace-nowrap">
                      {contact.errorMessage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailsDialog;
