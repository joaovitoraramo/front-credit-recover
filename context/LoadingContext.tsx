"use client";

import React, {createContext, useState, useContext, ReactNode} from 'react';

const LoadingContext = createContext({
    isLoading: false,
    setIsLoading: (e: boolean) => {
    },
});

export const LoadingProvider = ({children}: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{isLoading, setIsLoading}}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);