import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Dashboard.css';
import logo from '../Assets/newbackground.jpg';
import ambulanceIcon from '../Assets/responder.png';
import fireIcon from '../Assets/fire1.png';
import injuredIcon from '../Assets/injured1.png';
import vehicularIcon from '../Assets/car crash.png';
import policeIcon from '../Assets/police1.png'; 
import barangayIcon from '../Assets/barangay hall.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFile, faUsers, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Logout from '../../Logout';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const markerTypes = [
  { type: 'Responder', label: 'Responder Location' },
  { type: 'Accident', label: 'Accident Location' },
  { type: 'Accident', label: 'Accident Location' },
  { type: 'Fire', label: 'Fire Location' },
  { type: 'Police', label: 'Police Location' },
  { type: 'Barangay', label: 'Barangay Location' },
  { type: 'Injured', label: 'Injured Individual Location' }
];

const LocationMarker = () => {
  const [positions, setPositions] = useState([]);
  const [reportLocations, setReportLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8081/api/full_reports/locations')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched report locations:', data); // Log the fetched data
        setReportLocations(data);
      })
      .catch(error => console.error('Error fetching report locations:', error));
  }, []);

  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      setCurrentLocation(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const customIcons = {
    Responder: L.icon({ iconUrl: ambulanceIcon, iconSize: [70, 70], iconAnchor: [20, 40] }), // Use the imported image
    Accident: L.icon({  iconUrl: vehicularIcon, iconSize: [80, 80], iconAnchor: [20, 40] }),
    Fire: L.icon({  iconUrl: fireIcon, iconSize: [80, 80], iconAnchor: [20, 40] }),
    Police: L.icon({  iconUrl: policeIcon, iconSize: [80, 80], iconAnchor: [20, 40] }),
    Barangay: L.icon({  iconUrl: barangayIcon, iconSize: [80, 80], iconAnchor: [20, 40] }),
    Injured: L.icon({  iconUrl: injuredIcon, iconSize: [80, 80], iconAnchor: [20, 40] }),
  };

  return (
    <>
      {reportLocations.map((location, index) => {
        console.log('Rendering marker for location:', location); // Log each location being rendered
        let icon;
        if (location.type === 'Injured Individual') {
          icon = customIcons.Injured;
        } else if (location.type === 'Fire Emergency') {
          icon = customIcons.Fire;
        } else if (location.type === 'Vehicular Accident') {
          icon = customIcons.Accident;
        } else {
          icon = customIcons[location.type];
        }
        const adjustedPosition = [location.latitude + 0.0003, location.longitude];
        return (
          <Marker key={index} position={adjustedPosition} icon={icon}>
            <Popup>
              <div>
                <p>{location.type}</p>
                {location.imageUrl && <img src={`http://localhost:8081/${location.imageUrl}`} alt={location.type} style={{ width: '100px', height: '100px' }} />}
              </div>
            </Popup>
          </Marker>
        );
      })}
      {currentLocation && (
        <Marker position={currentLocation} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </>
  );
};

const legazpiBounds = [
  [12.9000, 123.5000], // Southwest coordinates
  [13.4000, 124.0000]  // Northeast coordinates
];

const center = [
  (legazpiBounds[0][0] + legazpiBounds[1][0]) / 2,
  (legazpiBounds[0][1] + legazpiBounds[1][1]) / 2
];

const AdminHome = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path, { replace: true });
  };

  return (
    <div className="body">
      <nav className="sidebar">
        <header className="header">
          <div className="image-text">
            <span className="image">
              <img src={logo} alt="logo" />
              <span className="title">Electronic</span>
              <span className="title">Response</span>
              <span className="title">Portal</span>
            </span>
          </div>
        </header>
        <div className="menu-bar">
          <div className="menu">
            <ul className="menu-links">
              <li className="nav-link">
              <a onClick={() => handleNavigation('/admin/home')}>
                  <FontAwesomeIcon icon={faHouse} className="icon" />
                  <span className="text nav-text">Home</span>
                </a>
              </li>
              <li className="nav-link">
              <a onClick={() => handleNavigation('/admin/reports')}>
                  <FontAwesomeIcon icon={faFile} className="icon" />
                  <span className="text nav-text">Reports</span>
                </a>
              </li>
              <li className="nav-link">
                <a onClick={() => handleNavigation('/admin/accounts')}>
                  <FontAwesomeIcon icon={faUsers} className="icon" />
                  <span className="text nav-text">Accounts</span>
                </a>
              </li>
              <li className="nav-link">
                <a onClick={() => handleNavigation('/admin/profile')}>
                  <FontAwesomeIcon icon={faCircleUser} className="icon" />
                  <span className="text nav-text">Profile</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="bottom-content">
            <Logout />
          </div>
        </div>
      </nav>
      <section className="home">
        <div className="text">Dashboard</div>
        <div className="text">Welcome, Admin</div>
        <div className="tabs-admin">
          <div className="home-wrapper">
            <MapContainer
              center={center}
              zoom={17}
              minZoom={13}
              maxZoom={17}
              bounds={legazpiBounds}
              maxBounds={legazpiBounds}
              maxBoundsViscosity={1.0}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker />
            </MapContainer>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminHome;