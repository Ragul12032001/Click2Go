import React, { useState, useEffect } from 'react';
import { Typography, Grid, } from '@mui/material';
import { Button } from 'src/Components/ui/button';
import { Card } from 'src/Components/ui/card';
import axios from 'axios';
import { Switch } from "src/Components/ui/switch";
import config from '../../config.json';
//import { ToastContainer, toast } from "react-toastify";
import { toast, useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import CircularProgress from "@mui/material/CircularProgress";


// Define the types for each state
type CampaignsState = {
    Campaign_status: number;
    Account_activity: number;
};

type SecurityAndBillingState = {
    Account_activity: number;
};

type NotificationsState = {
    Email: {
        Campaigns: CampaignsState;
        Security: SecurityAndBillingState;
        Billing: SecurityAndBillingState;
    };
    App: {
        Campaigns: CampaignsState;
        Security: SecurityAndBillingState;
        Billing: SecurityAndBillingState;
    };
};

interface NotificationDataItem {
    notification_data: string;
}

const Notification: React.FC<{ email: string }> = ({ email }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
    const toast = useToast();
    const [notifications, setNotifications] = useState<NotificationsState>({
        Email: {
            Campaigns: { Campaign_status: 0, Account_activity: 0 },
            Security: { Account_activity: 0 },
            Billing: { Account_activity: 0 },
        },
        App: {
            Campaigns: { Campaign_status: 0, Account_activity: 0 },
            Security: { Account_activity: 0 },
            Billing: { Account_activity: 0 },
        },
    });


    // Function to map API data to state
    const mapApiDataToState = (apiData: NotificationsState) => {
        setNotifications(apiData);
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {

                const response = await fetch("/config.json");
                console.log(response);

                const config = await response.json();

                console.log("Config loaded:", config); // Debugging log
                setApiUrlAdvAcc(config.ApiUrlAdvAcc); // Set API URL from config
                console.log(apiUrlAdvAcc);

            } catch (error) {
                console.error("Error loading config:", error);
            }
        };

        fetchConfig();
    }, []);



    // Fetch notification data from API
    useEffect(() => {
        setIsLoading(true);
        console.log(email);

        axios
            .get(`${apiUrlAdvAcc}/GetNotificationSettings?EmailId=` + email)
            .then(response => {
                if (response.data.status === 'Success') {
                    // Parse the notification_data string into JSON
                    const firstItem = response.data.notificationData[0];
                    const parsedData: NotificationsState = JSON.parse(firstItem.notification_data);
                    // Map the received API data to the component's state
                    mapApiDataToState(parsedData);
                    console.log(parsedData); // Log the parsed notification data
                } else if(response.data.status_Description) {
                    console.error(response.data.status_Description);
                    toast.toast({
                        title: "Error",
                        description: response.data.status_Description,
                        duration: 3000,
                    });
                } else {
                    toast.toast({
                        title: "Error",
                        description: "Something went wrong. Please try again.",
                        duration: 3000,
                    });
                }
            })
            .catch(error => {
                console.error("Error fetching notification settings:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [apiUrlAdvAcc]);



    // Toggle functions for Campaigns and Security/Billing
    const handleToggleCampaigns = (section: keyof NotificationsState, field: keyof CampaignsState, checked: boolean) => {
        setNotifications(prevState => ({
            ...prevState,
            [section]: {
                ...prevState[section],
                Campaigns: {
                    ...prevState[section].Campaigns,
                    [field]: prevState[section].Campaigns[field] === 1 ? 0 : 1,
                },
            },
        }));
    };

    const handleToggleSecurityBilling = (
        section: keyof NotificationsState,
        subSection: 'Security' | 'Billing',
        checked: boolean,
        field: keyof SecurityAndBillingState
    ) => {
        setNotifications(prevState => ({
            ...prevState,
            [section]: {
                ...prevState[section],
                [subSection]: {
                    ...prevState[section][subSection],
                    [field]: prevState[section][subSection][field] === 1 ? 0 : 1,
                },
            },
        }));
    };

    // Function to send updated notification data to the API
    const updateNotificationData = () => {
        setIsLoading(true);
        axios.put(`${apiUrlAdvAcc}/UpdateNotificationSettings/UpdateNotificationSettings`, {
            "emailId": email, // Email ID for the user
            "notificationData": JSON.stringify(notifications) // Stringify the current notification state
        })
            .then(response => {
                if (response.data.status === 'Success') {
                    console.log('Notification data updated successfully');
                    toast.toast({
                        title: "Success",
                        description: "Notifications updated successfully",
                        duration: 3000,
                    });
                } else {
                    toast.toast({
                        title: "Error",
                        description: "Failed to update notifications",
                        duration: 3000
                    })

                    console.error(response.data.status_Description);
                }
            })
            .catch(error => {
                console.error('Error updating notification data:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="flex ">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-50">
                    <CircularProgress className="text-primary" />
                </div>
            )}
            <Toaster />
            <div className="flex-grow  ml-0 p-2 h-screen overflow-y-auto">
                {/* Campaigns Section */}
                <Card className="mb-4 p-6 border border-grey text-left max-w-xl">
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <Typography >
                                <b className="text-[14px] font-medium text-[#020617]">Campaigns</b>
                            </Typography>
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center', color: '#64748B' }}>
                            <Typography style={{ fontSize: '10px', fontWeight: 400 }}>
                                <p className='pl-10'>Email</p>
                            </Typography >
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center', color: '#64748B' }}>
                            <Typography style={{ fontSize: '10px', fontWeight: 400 }}>
                            <p className='pl-10'>App</p>
                                {/* <p>App</p> */}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} alignItems="center" >
                        <Grid item xs={8}>
                            <Typography style={{ fontSize: '12px', color: '#64748B', fontWeight: 400 }}>Campaign status changed</Typography>
                        </Grid>
                        <Grid item xs={2} className='' style={{ textAlign: 'center' }}>
                            <Switch
                                className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 transition-colors ml-10 '
                                checked={notifications.Email.Campaigns.Campaign_status === 1}
                                onCheckedChange={(checked) => handleToggleCampaigns('Email', 'Campaign_status', checked)}
                            />
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center' }}>
                            <Switch
                                className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 transition-colors ml-10 '
                                checked={notifications.App.Campaigns.Campaign_status === 1}
                                onCheckedChange={(checked) => handleToggleCampaigns('App', 'Campaign_status', checked)}
                            />
                        </Grid>
                    </Grid>
                    <br></br>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <Typography style={{ fontSize: '12px', color: '#64748B', fontWeight: 400 }}>Receive emails about account activity</Typography>
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center' }}>
                            <Switch
                                className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 transition-colors ml-10 '
                                checked={notifications.Email.Campaigns.Account_activity === 1}
                                onCheckedChange={(checked) => handleToggleCampaigns('Email', 'Account_activity', checked)}
                            />
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center' }}>
                            <Switch
                                className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 transition-colors ml-10 '
                                checked={notifications.App.Campaigns.Account_activity === 1}
                                onCheckedChange={(checked) => handleToggleCampaigns('App', 'Account_activity', checked)}
                            />
                        </Grid>
                    </Grid>
                </Card>

                {/* Security Section */}
                <Card className="mb-4 p-6 border border-grey text-left max-w-xl">
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <Typography >
                                <b className='text-[14px] font-medium text-[#020617]'>Security</b>
                            </Typography>
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center', color: '#64748B' }}>
                            <Typography style={{ fontSize: '10px', fontWeight: 400 }}>
                                <p className='pl-10'>Email</p>
                            </Typography>
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center', color: '#64748B' }}>
                            <Typography style={{ fontSize: '10px', fontWeight: 400 }}>
                            <p className='pl-10'>App</p>

                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <Typography style={{ fontSize: '12px', color: '#64748B', fontWeight: 400 }}>Receive emails about account activity</Typography>
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center' }}>
                            <Switch
                                className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 transition-colors ml-10 '
                                checked={notifications.Email.Security.Account_activity === 1}
                                onCheckedChange={(checked) => handleToggleSecurityBilling('Email', 'Security', checked, 'Account_activity',)}
                            />
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center' }}>
                            <Switch
                                className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 transition-colors ml-10 '
                                checked={notifications.App.Security.Account_activity === 1}
                                onCheckedChange={(checked) => handleToggleSecurityBilling('App', 'Security', checked, 'Account_activity')}
                            />
                        </Grid>
                    </Grid>
                </Card>

                {/* Billing Section */}
                <Card className="mb-4 p-6 border border-grey text-left max-w-xl">
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <Typography >
                                <b className='text-[14px] font-medium text-[#020617]'>Billing</b>
                            </Typography>
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center', color: '#64748B' }}>
                            <Typography style={{ fontSize: '10px', fontWeight: 400 }}>
                                <p className='pl-10'>Email</p>
                            </Typography>
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center', color: '#64748B' }}>
                            <Typography style={{ fontSize: '10px', fontWeight: 400 }}>
                            <p className='pl-10'>App</p>

                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <Typography style={{ fontSize: '12px', color: '#64748B', fontWeight: 400 }}>Receive emails about account activity</Typography>
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center' }}>
                            <Switch
                                className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 transition-colors ml-10 '
                                checked={notifications.Email.Billing.Account_activity === 1}
                                onCheckedChange={(checked) => handleToggleSecurityBilling('Email', 'Billing', checked, 'Account_activity')}
                            />
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center' }}>
                            <Switch
                                className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 transition-colors ml-10 '
                                checked={notifications.App.Billing.Account_activity === 1}
                                onCheckedChange={(checked) => handleToggleSecurityBilling('App', 'Billing', checked, 'Account_activity')}
                            />
                        </Grid>
                    </Grid>
                </Card>
                <div className='w-full flex justify-start'>
                    <Button color="primary" className='w-[168px] m-0 gap-[10px] h-[40px] form-button' onClick={() => updateNotificationData()}>
                        <span className='text-[14px] font-medium text-[#F8FAFC]'>
                            Update notifications
                        </span>
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default Notification;