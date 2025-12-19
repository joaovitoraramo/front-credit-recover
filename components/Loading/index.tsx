"use client";

import React from 'react';
import {Loader2} from 'lucide-react';
import {useLoading} from '@/context/LoadingContext';

const Loading = () => {
    const {isLoading} = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <Loader2 size={80} className="animate-spin text-primary"/>
        </div>
    );
};

export default Loading;