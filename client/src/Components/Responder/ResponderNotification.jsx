import '../CSS/responder.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import UserLogout from '../../UserLogout';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationMarker = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, 15); // Zoom level 15
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Incident Location</Popup>
        </Marker>
    );
};

const CurrentLocationMarker = ({ position }) => {
    return position === null ? null : (
        <Marker position={position}>
            <Popup>Your Current Location</Popup>
        </Marker>
    );
};

const legazpiBounds = [
    [12.9000, 123.5000], // Southwest coordinates
    [13.4000, 124.0000]  // Northeast coordinates
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [buttonClicked, setButtonClicked] = useState(false);
    const [reportDetails, setReportDetails] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [userPosition, setUserPosition] = useState(null);
    const [distance, setDistance] = useState(null);
    const [eta, setEta] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/responder/report', {
                    credentials: 'include'
                });
                const data = await response.json();
                if (response.ok) {
                    setReportDetails(data);
                    console.log('Report Details Fetched:', data);
                } else {
                    console.error('Error fetching report details:', data.message);
                }
            } catch (error) {
                console.error('Error fetching report details:', error);
            }
        };

        fetchReportDetails();
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserPosition([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error('Error getting current position:', error);
                }
            );
        }
    }, []);

    useEffect(() => {
        if (reportDetails && userPosition) {
            const distance = calculateDistance(
                userPosition[0],
                userPosition[1],
                reportDetails.latitude,
                reportDetails.longitude
            );
            setDistance(distance);
        }
    }, [reportDetails, userPosition]);

    const handleRespondClick = async () => {
        setButtonClicked(true);
        console.log('Button Clicked:', buttonClicked);
        startCheckingDistance();

        if (distance) {
            const averageSpeed = 60;
            const etaMinutes = (distance / averageSpeed) * 60;
            const roundedEta = Math.ceil(etaMinutes);
            setEta(roundedEta);

            try {
                const sessionResponse = await fetch('http://localhost:8081/checkSession', {
                    credentials: 'include'
                });
                const sessionData = await sessionResponse.json();
                
                // Get responder type from responder_details
                const responderResponse = await fetch('http://localhost:8081/api/responder/type', {
                    credentials: 'include'
                });
                const responderData = await responderResponse.json();
                const isPolice = responderData.respondertype === 'Police';
                const responderId = responderData.id;

                if (!isPolice && reportDetails.closestResponderId && reportDetails.closestResponderId !== "No responder available") {
                    await fetch(`http://localhost:8081/api/full_report/${reportDetails.id}/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            status: 'waiting for responder', 
                            eta: roundedEta 
                        }),
                        credentials: 'include'
                    });
                } else if (isPolice && reportDetails.closestPoliceId === `responder_${responderId}`) {
                    await fetch(`http://localhost:8081/api/full_report/${reportDetails.id}/policeStatus`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            closestPoliceId: `responder_${responderId} (RESPONDING)`
                        }),
                        credentials: 'include'
                    });
                }
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const startCheckingDistance = () => {
        intervalRef.current = setInterval(async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const newUserPosition = [position.coords.latitude, position.coords.longitude];
                        setUserPosition(newUserPosition);

                        if (reportDetails) {
                            const newDistance = calculateDistance(
                                newUserPosition[0],
                                newUserPosition[1],
                                reportDetails.latitude,
                                reportDetails.longitude
                            );
                            setDistance(newDistance);

                            if (newDistance <= 0.1) {
                                clearInterval(intervalRef.current);

                                try {
                                    const responderResponse = await fetch('http://localhost:8081/api/responder/type', {
                                        credentials: 'include'
                                    });
                                    const responderData = await responderResponse.json();
                                    const isPolice = responderData.respondertype === 'Police';
                                    const responderId = responderData.id;

                                    if (!isPolice && reportDetails.closestResponderId && reportDetails.closestResponderId !== "No responder available") {
                                        await fetch(`http://localhost:8081/api/full_report/${reportDetails.id}/status`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({ 
                                                status: 'Responded',
                                                responderId: responderId 
                                            }),
                                            credentials: 'include'
                                        });
                                    } else if (isPolice && reportDetails.closestPoliceId.includes(`responder_${responderId}`)) {
                                        await fetch(`http://localhost:8081/api/full_report/${reportDetails.id}/policeStatus`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({ 
                                                closestPoliceId: `responder_${responderId} (RESPONDED)`
                                            }),
                                            credentials: 'include'
                                        });
                                    }
                                    navigate('/responder/final');
                                } catch (error) {
                                    console.error('Error updating status:', error);
                                }
                            }
                        }
                    },
                    (error) => {
                        console.error('Error getting current position:', error);
                    }
                );
            }
        }, 5000);
    };

    useEffect(() => {
        return () => clearInterval(intervalRef.current); // Clear interval on component unmount
    }, []);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        return distance.toFixed(2); // Return distance with 2 decimal places
    };

    const handleSetFakeReport = async () => {
        if (!reportDetails?.id) {
            console.log('No report ID found');
            return;
        }
        
        try {
            console.log('Attempting to mark report as fake:', reportDetails.id); // Debug log
            const response = await fetch(`http://localhost:8081/api/full_report/${reportDetails.id}/setFakeReport`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                console.log('Report marked as fake successfully');
                navigate('/responder/home');
            } else {
                console.error('Failed to mark report as fake:', await response.text());
            }
        } catch (error) {
            console.error('Error marking report as fake:', error);
        }
    };

    return (
        <div className="index-responder-body">
            <UserLogout />

            <div className="index-tabs-responder">
                <div className="parent-container">
                    <div id="map" className="map-container" alt="map">
                        <MapContainer 
                            bounds={legazpiBounds}
                            maxBoundsViscosity={1.0}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                            whenCreated={(map) => map.locate({ setView: true, maxZoom: 16 })}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {reportDetails && (
                                <LocationMarker position={[reportDetails.latitude, reportDetails.longitude]} />
                            )}
                            {userPosition && (
                                <CurrentLocationMarker position={userPosition} />
                            )}
                            <MapEvents setCurrentPosition={setCurrentPosition} />
                        </MapContainer>
                    </div>
                </div>

                <div className="report-container">
                    <p className='report-header-text'>Emergency Report Details</p>
                    <div className='report-parent-container'>
                        <div className="report-details-container">
                            {reportDetails ? (
                                <>
                                    <p className="d1">ID: {reportDetails.id}</p>
                                    <p className="d2">Type: {reportDetails.type}</p>
                                    <p className="d3">Victim: {reportDetails.victim}</p>
                                    <p className="d4">Reporter ID: {reportDetails.reporterId}</p>
                                    <p className="d6">Location: {reportDetails.location}</p>
                                    <p className="d6">Latitude: {reportDetails.latitude}</p>
                                    <p className="d6">Longitude: {reportDetails.longitude}</p>
                                    <p className="d6">Description: {reportDetails.description}</p>
                                    <p className="d6">Date/Time: {new Date(reportDetails.uploadedAt).toLocaleString()}</p>
                                    {distance && <p className="d6">Distance: {distance} km</p>}
                                    {eta && <p className="d6">Estimated Time of Arrival: {eta} minutes</p>}
                                </>
                            ) : (
                                <p>Loading report details...</p>
                            )}
                        </div>
                        <div className="notif-picture-container">
                        {reportDetails && reportDetails.imageUrl && (
                            <img src={`http://localhost:8081/${reportDetails.imageUrl}`} alt="Scene Photo" className="scene-picture" />
                        )}
                        </div>
                    </div>
                </div>

                <div className='respond-btn-container'>
                    <button
                        id="respond-btn"
                        className={`respond-btn ${buttonClicked ? 'button-hidden' : ''}`}
                        onClick={handleRespondClick}>
                        RESPOND
                    </button>
                    <p id="respond-text" className={`respond-text ${buttonClicked ? 'text-visible' : 'text-hidden'}`}>
                        Responding to the scene...
                    </p>
                </div>

                <div className='fake-report-btn-container'>
                    <button
                        className="fake-report-btn"
                        onClick={handleSetFakeReport}>
                        Set as Fake Report
                    </button>
                </div>

                <button onClick={() => navigate('/responder/final')}>Next</button> {/* temporary */}
            </div>
        </div>
    );
};

const MapEvents = ({ setCurrentPosition }) => {
    useMapEvents({
        locationfound(e) {
            console.log('Location Found:', e.latlng);
            setCurrentPosition(e.latlng);
        },
        locationerror(e) {
            console.error('Location Error:', e.message);
        },
    });

    return null;
};

export default Dashboard;