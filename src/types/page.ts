import { FC } from "react";

export interface PageProps {
    title: string;
    icon: React.ReactNode;
    tabs: string[];
    path: string;
    show: boolean;
    element: FC<any>;
}