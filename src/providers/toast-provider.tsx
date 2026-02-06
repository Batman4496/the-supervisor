import React, { useEffect } from 'react';
import { toast, ToastContainer } from "react-toastify";

function ToastProvider(props: React.PropsWithChildren) {
    useEffect(() => {
        window.api.onError((error: any) => {
            toast.error(String(error));
        });
    }, []);

    return (
        <>
        {props.children}
        <ToastContainer position="bottom-right" />
        </>
    );
}

export default ToastProvider;