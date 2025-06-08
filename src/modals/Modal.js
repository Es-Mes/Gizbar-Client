import React from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, children, disableOverlayClick = false }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay "
            onClick={() => {
                if (!disableOverlayClick) {
                    onClose();
                }
            }}
        >
            
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    ✖
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
