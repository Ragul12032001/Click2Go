import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { useState, useRef, useEffect } from "react";
import { DialogContent } from "../../Components/ui/dialog";
import { Dialog } from "../../Components/ui/dialog";
import { DialogTitle } from "../../Components/ui/dialog";
import { DialogHeader } from "../../Components/ui/dialog";
import { DialogDescription } from "../../Components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Components/ui/select";
import axios from "axios"; // Axios for API requests
import { RootState } from "@/src/State/store";
import { useSelector } from "react-redux";
import { setworkspace } from "@/src/State/slices/AuthenticationSlice";
import { Weight } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Toast } from "../../Components/ui/toast";
import { useToast } from "../../Components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../Components/ui/tooltip";
interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audienceNames: string[];
  audiencefile_id?: number;
}

interface ExcelRow {
  firstname: string;
  lastname: string;
  phoneno: string;
  location?: string; // Optional field
  audiencefile_id?: number;
}

const CreateListDialog: React.FC<CreateListDialogProps> = ({
  open,
  onOpenChange,
  audienceNames,
  audiencefile_id,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [nameError, setNameError] = useState("");
  const [listName, setListName] = useState("");
  const [workspaceId, setWorkspaceId] = useState("0"); // Added state for workspace selection
  const [uploading, setUploading] = useState(false);
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Track selected file
  const wid = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
        console.log(audiencefile_id);
      } catch (error) {
        console.error("Error loading config or fetching workspaces:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (!open) {
      // Reset edit mode immediately
      setIsEditMode(false);

      // Reset form data and errors when the dialog closes
      setFileName("");
      setFileError("");
      setNameError("");
      setListName("");
      setWorkspaceId("0");
      setSelectedFile(null);
      setShowHelp(false);

      // Restore pointer events after a short delay
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    } else if (audiencefile_id && audiencefile_id > 0) {
      console.log("TRUE :", audiencefile_id);
      setIsEditMode(true);
    }
  }, [open, audiencefile_id]);

  useEffect(() => {
    console.log("Audience Names in dialog: ", audienceNames); // You can log the audience names or use them elsewhere
  }, [audienceNames]);

  const handleDialogChange = (event: any) => {
    onOpenChange(event.target?.checked || false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const dotCount = (file.name.match(/\./g) || []).length;
      if (dotCount > 1) {
        setFileName("");
        setFileError("Invalid file name");
        return;
      }

      setFileName(file.name); // Set the file name to display
      setSelectedFile(file); // Store the selected file in state
      setFileError(""); // Clear any previous error

      // Add support for txt, csv, and xlsx file types
      const validFileTypes = [
        "text/csv",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX MIME type
      ];

      // 25MB file size limit
      const maxFileSize = 25 * 1024 * 1024; // 25MB in bytes
      // Check for file type validity
      if (!validFileTypes.includes(file.type)) {
        setFileError("Please select a valid CSV, TXT, or XLSX file.");
        setFileName("");
        return;
      }

      // Check for file size validity
      if (file.size > maxFileSize) {
        setFileError("File size exceeds the 25MB limit.");
        setFileName("");
        return;
      }

      try {
        // Validate required columns based on file type
        const requiredColumns = [
          "firstname",
          "lastname",
          "phoneno",
          "location",
        ];

        if (file.type === "text/csv" || file.type === "text/plain") {
          // Validate CSV/TXT files
          await validateCSVOrTXTFile(file, requiredColumns);
        } else if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          // Validate XLSX files
          await validateXLSXFile(file, requiredColumns);
        }

        // If validation passes
        setFileError("");
        setFileName(file.name);
      } catch (error: any) {
        setFileError(
          error.message || "An error occurred while validating the file."
        );
        setFileName("");
      }
    } else if (selectedFile) {
      setFileName("");
      return;
    } else {
      setFileError("Please Select File");
      return;
    }
  };

  const validateCSVOrTXTFile = (
    file: File,
    requiredColumns: string[]
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        const delimiter = fileContent.includes("|") ? "|" : ","; // Determine delimiter
        const headers = fileContent
          .split("\n")[0]
          .split(delimiter)
          .map((header) => header.trim().toLowerCase());

        // Check for missing columns
        const missingColumns = requiredColumns.filter(
          (col) => !headers.includes(col)
        );
        if (missingColumns.length > 0) {
          reject(
            new Error(`Missing necessary columns: ${missingColumns.join(", ")}`)
          );
          return;
        }

        // Check for correct column order
        const isCorrectOrder = requiredColumns.every(
          (col, index) => headers[index] === col
        );

        if (!isCorrectOrder) {
          reject(
            new Error(
              "Ensure your coulmn order, 'firstname','lastname','phoneno','location'."
            )
          );
          return;
        }

        resolve();
      };

      reader.onerror = () => {
        reject(new Error("Failed to read the file."));
      };

      reader.readAsText(file);
    });
  };

  const validateXLSXFile = (
    file: File,
    requiredColumns: string[]
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
          header: 1,
        }) as string[][];

        if (!jsonData || jsonData.length === 0) {
          reject(new Error("File is empty."));
          return;
        }

        const headers = jsonData[0].map((header) =>
          header.trim().toLowerCase()
        );

        // Check for missing columns
        const missingColumns = requiredColumns.filter(
          (col) => !headers.includes(col)
        );
        if (missingColumns.length > 0) {
          reject(
            new Error(`Missing necessary columns: ${missingColumns.join(", ")}`)
          );
        } else {
          resolve();
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read the file."));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const validateListName = (value: string): boolean => {
    const validPattern = /^[a-zA-Z][a-zA-Z0-9 _-]*[a-zA-Z0-9]$/;
    // Full validation regex
    const startsWithLetterPattern = /^[a-zA-Z]/; // First character must be a letter

    if (value.length === 0) {
      console.log("List name cannot be empty");
      setNameError("List name cannot be empty");
      return false;
    }

    // Check if the first character is a letter
    if (!startsWithLetterPattern.test(value)) {
      console.log("The list name must start with a letter.");
      setNameError("The list name must start with a letter.");
      return false;
    }

    // Validate the entire string
    if (!validPattern.test(value)) {
      console.log(
        "The list name must start with a letter, end with a letter/number, and can only include '_', '-', or spaces in between."
      );
      setNameError(
        "The list name must start with a letter, end with a letter/number, and can only include '_', '-', or spaces in between."
      );
      return false;
    }

    // All validations passed
    console.log("List name is valid");
    return true;
  };

  const handleInputChange = (value: string) => {
    setListName(value); // Always update the state with the latest value

    if (validateListName(value)) {
      console.log("List name is correct");
      setNameError(""); // Clear any previous error
    } else {
      console.log("List name is incorrect");
    }
  };

  const handleCompleteClick = async () => {
    if (isEditMode) {
      let localNameError = nameError; // Track name error locally
      // Check if any field is missing or if the file is invalid
      if (!audiencefile_id || !listName) {
        setFileError("Please fill all required fields.");
        return;
      }
      if (localNameError) {
        console.log("Error msg occured");
        return null;
      }
      if (audienceNames.includes(listName)) {
        setNameError(
          "The list name already exists. Please choose a different name."
        );
        localNameError =
          "The list name already exists. Please choose a different name.";
        return;
      } else {
        setFileError("");
        localNameError = "";
      }
      console.log("List ID :", audiencefile_id, "Listname :", listName);
      try {
        setUploading(true);
        const response = await axios.post(
          `${apiUrlAdvAcc}/UpdateListNameByListId`,
          null,
          {
            params: {
              list_id: audiencefile_id,
              list_name: listName,
            },
          }
        );
        if (response.data.status === "Success") {
          toast.toast({
            title: "Success",
            description: "File name updated successfully.",
          });
          console.log(response.data.status);
          onOpenChange(false);
        } else {
          toast.toast({
            title: "Failure",
            description: "Something went wrong, please try again.",
          });
        }
        console.log("Response:", response.data);
      } catch (error) {
        toast.toast({
          title: "Failure",
          description: "Something went wrong, please try again.",
        });
        console.log("Error :", error);
      } finally {
        setUploading(false);
        onOpenChange(false);
      }
    } else {
      console.log(fileName, wid, listName);

      let localFileError = fileError; // Track file error locally
      let localNameError = nameError; // Track name error locally

      // Check if any field is missing or if the file is invalid
      if (!fileName || !wid || !listName) {
        setFileError("Please fill all required fields.");
        return;
      }

      // Ensure the file is valid
      if (!selectedFile) {
        setFileError("File not found. Please re-upload.");
        return;
      }

      const file = fileInputRef.current?.files?.[0];

      if (file) {
        if (audienceNames.includes(listName)) {
          setFileError(
            "The list name already exists. Please choose a different name."
          );
          localFileError =
            "The list name already exists. Please choose a different name.";
          return;
        } else {
          setFileError("");
          localFileError = "";
        }
      }

      if (localNameError || localFileError) {
        console.log("Error msg occured");
        return null;
      }

      // If no file is selected, show an error
      if (!file) {
        setFileError("File not found. Please re-upload.");
        return;
      }

      const formData = new FormData();

      // Ensure that file is not undefined before appending
      if (file) {
        formData.append("file", file);
      }

      formData.append("listName", listName);
      formData.append("workspace_id", String(wid)); // Append workspace_id

      try {
        setUploading(true);
        const response = await axios.post(
          `${apiUrlAdvAcc}/contact_upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const response_data = response.data[0];
        console.log(response_data.Status);
        if (response_data.Status === "Success") {
          toast.toast({
            title: "Success",
            description: "File Uploaded Successfully.",
          });
          onOpenChange(false);
        } else {
          setFileError(
            response.data.Status_Description || "An error occurred."
          );
        }
      } catch (error) {
        console.error("Upload Error:", error);
        setFileError("Failed to upload file. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-18px font-semibold text-[#09090B]">
            {isEditMode ? "Update list name" : "Create list"}
          </DialogTitle>

          <DialogDescription className="text-14px font-medium text-[#71717A] leading-[16.94px]">
            {isEditMode
              ? "Update the name of your customer list to keep it organized."
              : "Create a new list of customers using their phone numbers."}
          </DialogDescription>
        </DialogHeader>

        <form>
          <div className="mb-4 flex flex-col gap-[6px]">
            <Label
              htmlFor="list-name"
              className="text-14px font-medium text-[#020617]"
            >
              Name
            </Label>
            <Input
              id="list-name"
              type="text"
              placeholder="Add your list name..."
              value={listName}
              onChange={(e) => handleInputChange(e.target.value)}
              className="text-[14px] font-normal placeholder:text-[#64748B]"
            />
            {nameError && (
              <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">
                {nameError}
              </p>
            )}
          </div>

          {isEditMode ? null : (
            <>
              <div>
                <div className="flex flex-col w-full gap-[6px] my-5">
                  <Label
                    htmlFor="upload-file"
                    className="text-[14px] font-medium text-[#0F172A]"
                  >
                    Upload File
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="upload-file"
                      type="text"
                      value={fileName}
                      readOnly
                      className="flex-grow w-[80%] border-[#E2E8F0] text-[#020617] placeholder-[#64748B] placeholder:font-normal"
                      placeholder="Choose File   No file chosen"
                    />
                    <Button
                      type="button"
                      className="bg-[#F1F5F9] w-[30%] text-[#fff] font-medium text-[14px] hover:bg-gray-300 focus:ring-gray-400 h-8.1 mt--1 form-button"
                      onClick={handleUploadClick}
                      style={{
                        height: "2.2rem",
                        padding: "0 0.5rem",
                        fontWeight: "500", // Apply font-medium equivalent directly
                      }}
                    >
                      Upload file
                    </Button>
                    <input
                      ref={fileInputRef}
                      id="companyLogo"
                      type="file"
                      accept=".csv, .txt, .xlsx, .xls"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </div>
                  <span className="text-[14px] text-[#64748B] font-normal">
                    *.csv, *.xlsx, *.txt files up to 25MB
                  </span>
                  <div className="flex w-full justify-start mb-1">
                    <button
                      type="button"
                      onClick={() => setShowHelp(!showHelp)}
                      className="flex ml-1 text-green-500 text-sm"
                    >
                      Need help?
                    </button>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {showHelp && (
                      <div className="flex w-full flex-col text-gray-600 text-sm">
                        <p>
                          <strong className="ml-1 mb-1">Example format:</strong>
                        </p>
                        <p className="mt-1">
                          <span className="text-[14px] text-[#64748B] font-normal">
                            *.csv, *.xlsx:
                          </span>
                        </p>

                        <table className="w-full border-2 border-black text-center rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-[#F1F5F9]">
                              <th className="border-2 border-black p-2 first:rounded-tl-lg last:rounded-tr-lg">
                                firstname
                              </th>
                              <th className="border-2 border-black p-2">lastname</th>
                              <th className="border-2 border-black p-2">
                                <span className="">phoneno</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="ml-1 text-gray-500 cursor-pointer">ℹ️</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-black">Format: (+Country Code + Number)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </th>
                              <th className="border-2 border-black p-2 last:rounded-tr-lg">location</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-2 border-black">
                              <td className="border-2 border-black p-2">Ahmed</td>
                              <td className="border-2 border-black p-2">Al Mansoori</td>
                              <td className="border-2 border-black p-2">+971501234567</td>
                              <td className="border-2 border-black p-2">Dubai</td>
                            </tr>
                          </tbody>
                        </table>

                        <p>
                          <span className="text-[14px] text-[#64748B] font-normal">
                            *.txt:
                          </span>
                        </p>
                        <div className="w-full text-center rounded-lg overflow-hidden">
                          {/* Header */}
                          <div className="bg-[#F1F5F9] grid grid-cols-[1fr_auto_1fr_auto_1.5fr_auto_1fr] p-2 font-mono text-sm items-center font-bold">
                            <div className="text-center">firstname</div>
                            <div className="text-center">|</div>
                            <div className="text-center">lastname</div>
                            <div className="text-center">|</div>
                            <div className="flex items-center justify-center gap-1">
                              phoneno
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="ml-1 text-gray-500 cursor-pointer">ℹ️</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-black">Format: (+Country Code + Number)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="text-center">|</div>
                            <div className="text-center">location</div>
                          </div>

                          {/* Data Row */}
                          <div className="grid grid-cols-[1fr_auto_1fr_auto_1.5fr_auto_1fr] p-2 border-t font-mono text-sm items-center">
                            <div className="text-center">Ahmed</div>
                            <div className="text-center">|</div>
                            <div className="text-center">Al Mansoori</div>
                            <div className="text-center">|</div>
                            <div className="text-center">+971501234567</div>
                            <div className="text-center">|</div>
                            <div className="text-center">Dubai</div>
                          </div>
                        </div>

                        <div className="w-full text-center rounded-lg overflow-hidden mt-2">
                          {/* Header */}
                          <div className="bg-[#F1F5F9] grid grid-cols-[1fr_auto_1fr_auto_1.5fr_auto_1fr] p-2 font-mono text-sm items-center font-bold">
                            <div className="text-center">firstname</div>
                            <div className="text-center">,</div>
                            <div className="text-center">lastname</div>
                            <div className="text-center">,</div>
                            <div className="flex items-center justify-center gap-1">
                              phoneno
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="ml-1 text-gray-500 cursor-pointer">ℹ️</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-black">Format: (+Country Code + Number)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="text-center">,</div>
                            <div className="text-center">location</div>
                          </div>

                          {/* Data Row */}
                          <div className="grid grid-cols-[1fr_auto_1fr_auto_1.5fr_auto_1fr] p-2 border-t font-mono text-sm items-center">
                            <div className="text-center">Ahmed</div>
                            <div className="text-center">,</div>
                            <div className="text-center">Al Mansoori</div>
                            <div className="text-center">,</div>
                            <div className="text-center">+971501234567</div>
                            <div className="text-center">,</div>
                            <div className="text-center">Dubai</div>
                          </div>
                        </div>



                      </div>
                    )}
                  </div>

                  {fileError && (
                    <p className="text-red-500 text-xs font-medium mt-1 font-sans italic ml-1 text-left">
                      {fileError}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          <Button
            type="button"
            onClick={handleCompleteClick}
            disabled={uploading}
            className="w-full mt-2 text-[14px] font-medium text-[#FAFAFA] bg-[#3A85F7] form-button"
          >
            {uploading ? "Uploading..." : isEditMode ? "Update" : "Complete"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
