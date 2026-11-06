"""
Seed Dataset for Intelligent Route Optimization & Navigation System
Contains realistic geographical nodes and roads covering a major urban network
(Manhattan / Brooklyn metropolitan zone), including bridges, expressways,
arterial avenues, local streets, and an island for connectivity testing.
"""

INITIAL_LOCATIONS = [
    {"id": 1, "name": "Central Station Terminal", "latitude": 40.7527, "longitude": -73.9772, "elevation_m": 12.0, "type": "terminal", "description": "Major transit hub"},
    {"id": 2, "name": "Times Square Hub", "latitude": 40.7580, "longitude": -73.9855, "elevation_m": 10.0, "type": "poi", "description": "Midtown commercial center"},
    {"id": 3, "name": "Rockefeller Plaza", "latitude": 40.7587, "longitude": -73.9787, "elevation_m": 14.0, "type": "poi", "description": "Midtown landmark"},
    {"id": 4, "name": "Empire State Tower", "latitude": 40.7484, "longitude": -73.9857, "elevation_m": 15.0, "type": "poi", "description": "Iconic skyscraper"},
    {"id": 5, "name": "Madison Square Park", "latitude": 40.7411, "longitude": -73.9897, "elevation_m": 8.0, "type": "poi", "description": "Flatiron intersection"},
    {"id": 6, "name": "Union Square Station", "latitude": 40.7359, "longitude": -73.9911, "elevation_m": 7.0, "type": "terminal", "description": "Subway crossroads"},
    {"id": 7, "name": "Washington Square Arch", "latitude": 40.7308, "longitude": -73.9973, "elevation_m": 6.0, "type": "poi", "description": "Greenwich Village"},
    {"id": 8, "name": "SoHo Art District", "latitude": 40.7233, "longitude": -74.0030, "elevation_m": 5.0, "type": "poi", "description": "Historic shopping area"},
    {"id": 9, "name": "City Hall & Civic Center", "latitude": 40.7128, "longitude": -74.0060, "elevation_m": 8.0, "type": "poi", "description": "Government headquarters"},
    {"id": 10, "name": "World Trade Center", "latitude": 40.7118, "longitude": -74.0131, "elevation_m": 6.0, "type": "poi", "description": "Financial core"},
    {"id": 11, "name": "Wall Street Exchange", "latitude": 40.7068, "longitude": -74.0090, "elevation_m": 5.0, "type": "poi", "description": "Global finance"},
    {"id": 12, "name": "Battery Park Terminal", "latitude": 40.7033, "longitude": -74.0170, "elevation_m": 3.0, "type": "terminal", "description": "Southern waterfront"},
    {"id": 13, "name": "Metropolitan General Hospital", "latitude": 40.7430, "longitude": -73.9740, "elevation_m": 11.0, "type": "hospital", "description": "Emergency medical center"},
    {"id": 14, "name": "FDR East River Interchange", "latitude": 40.7310, "longitude": -73.9740, "elevation_m": 4.0, "type": "intersection", "description": "High-speed waterfront bypass"},
    {"id": 15, "name": "Lincoln Tunnel Approach", "latitude": 40.7600, "longitude": -74.0000, "elevation_m": 5.0, "type": "terminal", "description": "Western gateway"},
    {"id": 16, "name": "Hudson Yards Complex", "latitude": 40.7536, "longitude": -74.0022, "elevation_m": 9.0, "type": "poi", "description": "Modern high-rise development"},
    {"id": 17, "name": "Chelsea Market", "latitude": 40.7425, "longitude": -74.0060, "elevation_m": 6.0, "type": "poi", "description": "Culinary & tech center"},
    {"id": 18, "name": "West Side Highway Link", "latitude": 40.7280, "longitude": -74.0110, "elevation_m": 4.0, "type": "intersection", "description": "Express highway segment"},
    {"id": 19, "name": "Williamsburg Bridge Anchorage", "latitude": 40.7170, "longitude": -73.9780, "elevation_m": 14.0, "type": "intersection", "description": "East River crossing"},
    {"id": 20, "name": "Brooklyn Bridge Anchorage", "latitude": 40.7100, "longitude": -73.9990, "elevation_m": 18.0, "type": "intersection", "description": "Historic suspension bridge"},
    {"id": 21, "name": "DUMBO Waterfront", "latitude": 40.7030, "longitude": -73.9890, "elevation_m": 5.0, "type": "poi", "description": "Brooklyn tech corridor"},
    {"id": 22, "name": "Brooklyn Heights Promenade", "latitude": 40.6970, "longitude": -73.9950, "elevation_m": 12.0, "type": "poi", "description": "Scenic overlook"},
    {"id": 23, "name": "Columbus Circle Plaza", "latitude": 40.7681, "longitude": -73.9819, "elevation_m": 16.0, "type": "poi", "description": "Central Park entrance"},
    {"id": 24, "name": "Metropolitan Museum of Art", "latitude": 40.7794, "longitude": -73.9632, "elevation_m": 22.0, "type": "poi", "description": "Uptown cultural institution"},
    # Isolated / Disconnected Island (Tests Component Analysis & DSU)
    {"id": 90, "name": "Governors Island Lighthouse", "latitude": 40.6900, "longitude": -74.0150, "elevation_m": 4.0, "type": "terminal", "description": "Isolated harbor island"},
    {"id": 91, "name": "Governors Fort Jay", "latitude": 40.6920, "longitude": -74.0170, "elevation_m": 8.0, "type": "poi", "description": "Island historic site"},
]

INITIAL_ROADS = [
    # Uptown & Midtown Grid
    {"id": "r_23_3", "source_id": 23, "target_id": 3, "distance_km": 1.1, "speed_limit_kmh": 45.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "57th Street Cross", "road_type": "arterial"},
    {"id": "r_23_2", "source_id": 23, "target_id": 2, "distance_km": 1.2, "speed_limit_kmh": 40.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Broadway North", "road_type": "avenue"},
    {"id": "r_23_24", "source_id": 23, "target_id": 24, "distance_km": 2.1, "speed_limit_kmh": 50.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "5th Avenue Uptown", "road_type": "avenue"},
    {"id": "r_3_1", "source_id": 3, "target_id": 1, "distance_km": 0.7, "speed_limit_kmh": 40.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Park Ave Midtown", "road_type": "arterial"},
    {"id": "r_2_3", "source_id": 2, "target_id": 3, "distance_km": 0.6, "speed_limit_kmh": 35.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "49th Street", "road_type": "residential"},
    {"id": "r_2_1", "source_id": 2, "target_id": 1, "distance_km": 0.9, "speed_limit_kmh": 40.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "42nd Street Express", "road_type": "arterial"},
    {"id": "r_2_15", "source_id": 2, "target_id": 15, "distance_km": 1.3, "speed_limit_kmh": 45.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "42nd Street West", "road_type": "arterial"},
    {"id": "r_15_16", "source_id": 15, "target_id": 16, "distance_km": 0.8, "speed_limit_kmh": 40.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "11th Avenue", "road_type": "avenue"},
    {"id": "r_16_17", "source_id": 16, "target_id": 17, "distance_km": 1.3, "speed_limit_kmh": 45.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "10th Avenue South", "road_type": "avenue"},
    
    # Midtown Spine
    {"id": "r_1_4", "source_id": 1, "target_id": 4, "distance_km": 0.8, "speed_limit_kmh": 35.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Madison Avenue", "road_type": "avenue"},
    {"id": "r_2_4", "source_id": 2, "target_id": 4, "distance_km": 1.1, "speed_limit_kmh": 30.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Broadway Midtown", "road_type": "avenue"},
    {"id": "r_1_13", "source_id": 1, "target_id": 13, "distance_km": 1.2, "speed_limit_kmh": 40.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "1st Avenue East", "road_type": "arterial"},
    {"id": "r_4_13", "source_id": 4, "target_id": 13, "distance_km": 1.1, "speed_limit_kmh": 35.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "34th Street Hospital Access", "road_type": "arterial"},
    {"id": "r_13_14", "source_id": 13, "target_id": 14, "distance_km": 1.4, "speed_limit_kmh": 70.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "FDR Drive Midtown Connector", "road_type": "highway"},
    
    # Flatiron, Chelsea & Village
    {"id": "r_4_5", "source_id": 4, "target_id": 5, "distance_km": 0.9, "speed_limit_kmh": 35.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "5th Avenue South", "road_type": "avenue"},
    {"id": "r_17_5", "source_id": 17, "target_id": 5, "distance_km": 1.4, "speed_limit_kmh": 35.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "23rd Street Cross", "road_type": "arterial"},
    {"id": "r_5_6", "source_id": 5, "target_id": 6, "distance_km": 0.6, "speed_limit_kmh": 30.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Broadway Flatiron", "road_type": "avenue"},
    {"id": "r_14_6", "source_id": 14, "target_id": 6, "distance_km": 1.5, "speed_limit_kmh": 40.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "14th Street Corridor", "road_type": "arterial"},
    {"id": "r_6_7", "source_id": 6, "target_id": 7, "distance_km": 0.8, "speed_limit_kmh": 30.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "University Place", "road_type": "residential"},
    {"id": "r_17_18", "source_id": 17, "target_id": 18, "distance_km": 1.7, "speed_limit_kmh": 65.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "West Side Highway Link", "road_type": "highway"},
    {"id": "r_7_18", "source_id": 7, "target_id": 18, "distance_km": 1.2, "speed_limit_kmh": 35.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Houston Street West", "road_type": "arterial"},
    
    # SoHo & Lower Manhattan
    {"id": "r_7_8", "source_id": 7, "target_id": 8, "distance_km": 0.9, "speed_limit_kmh": 30.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "West Broadway", "road_type": "avenue"},
    {"id": "r_8_9", "source_id": 8, "target_id": 9, "distance_km": 1.2, "speed_limit_kmh": 35.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Lafayette Street South", "road_type": "arterial"},
    {"id": "r_14_19", "source_id": 14, "target_id": 19, "distance_km": 1.6, "speed_limit_kmh": 65.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "FDR Lower Expressway", "road_type": "highway"},
    {"id": "r_19_8", "source_id": 19, "target_id": 8, "distance_km": 2.2, "speed_limit_kmh": 40.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Delancey Street", "road_type": "arterial"},
    {"id": "r_18_10", "source_id": 18, "target_id": 10, "distance_km": 1.8, "speed_limit_kmh": 60.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "West St Expressway", "road_type": "highway"},
    {"id": "r_9_10", "source_id": 9, "target_id": 10, "distance_km": 0.6, "speed_limit_kmh": 30.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Vesey Street", "road_type": "residential"},
    {"id": "r_9_20", "source_id": 9, "target_id": 20, "distance_km": 0.7, "speed_limit_kmh": 40.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Park Row Civic Access", "road_type": "arterial"},
    {"id": "r_10_11", "source_id": 10, "target_id": 11, "distance_km": 0.7, "speed_limit_kmh": 25.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Wall Street Corridor", "road_type": "residential"},
    {"id": "r_11_12", "source_id": 11, "target_id": 12, "distance_km": 0.8, "speed_limit_kmh": 30.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Broad Street Waterfront", "road_type": "arterial"},
    {"id": "r_10_12", "source_id": 10, "target_id": 12, "distance_km": 1.0, "speed_limit_kmh": 45.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Battery Place", "road_type": "arterial"},
    
    # River Crossings & Brooklyn
    {"id": "r_20_21", "source_id": 20, "target_id": 21, "distance_km": 1.8, "speed_limit_kmh": 55.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Brooklyn Bridge Span", "road_type": "highway"},
    {"id": "r_19_21", "source_id": 19, "target_id": 21, "distance_km": 2.6, "speed_limit_kmh": 60.0, "traffic_level": "LOW", "toll_cost": 3.50, "is_one_way": False, "road_name": "Williamsburg Bridge Toll Bypass", "road_type": "highway"},
    {"id": "r_21_22", "source_id": 21, "target_id": 22, "distance_km": 0.9, "speed_limit_kmh": 35.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Cadman Plaza West", "road_type": "arterial"},

    # Island Connection (Isolated Island)
    {"id": "r_90_91", "source_id": 90, "target_id": 91, "distance_km": 0.3, "speed_limit_kmh": 20.0, "traffic_level": "LOW", "toll_cost": 0.0, "is_one_way": False, "road_name": "Governors Island Pathway", "road_type": "residential"},
]
