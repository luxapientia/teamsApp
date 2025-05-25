import { FC } from "react";

export interface PageProps {
    title: string;
    icon: React.ReactNode;
    tabs: string[];
    selectedTab: string;
    path: string;
    show: boolean;
    element: FC<any>;
}