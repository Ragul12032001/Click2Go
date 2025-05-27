export const defaultConfig = {
    ProjectTracking: {
        BaseURL: "",
        LoginPath: "/api/Login/Login",
    },
};

export const TIMER_SETTINGS = {
    INITIAL_TIME: 60, // Default timer value in seconds
};

interface Config {
    ProjectTracking: {
        BaseURL: string;
        LoginPath: string;
    };
}

class GlobalConfig {
    private config: Config;
    private isDefined: boolean;

    constructor() {
        this.config = defaultConfig;
        this.isDefined = false;
    }

    Get(): Config {
        if (!this.isDefined) {
            console.error("App config not defined yet. Returning default value");
        }
        return this.config;
    }

    Set(value: Config): void {
        if (this.isDefined) {
            console.warn("App config already defined. Skipping.");
        } else {
            this.config = value;
            this.isDefined = true;
        }
    }
}

// export function LoadGlobalConfig() {
//     globalConfig.isDefined = false;
//     //return axios(globalConfigUrl);
// }

export const globalConfig = new GlobalConfig();
export const globalConfigUrl = "app.settings.json";
