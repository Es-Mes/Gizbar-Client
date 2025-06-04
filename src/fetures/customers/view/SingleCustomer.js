import React from 'react'
import { GrFormNextLink } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom';

const SingleCustomer = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="header-with-button">
                <button className="backButton" onClick={() => navigate(-1)}>
                    <GrFormNextLink />
                </button>
                <h2>פרטי לקוח</h2>
            </div>

            <div>SingleCustomer</div>
        </>
    )
}

export default SingleCustomer