#pragma once

#include "Types.hpp"
#include <string>
#include <cmath>
#include <numbers>

namespace dsa {

class Node {
public:
    NodeId id{0};
    std::string name;
    double latitude{0.0};
    double longitude{0.0};
    double elevation_m{0.0};
    std::string type{"intersection"}; // "intersection", "poi", "terminal", "station"

    Node() = default;

    Node(NodeId id, std::string name, double latitude, double longitude, 
         double elevation = 0.0, std::string type = "intersection")
        : id(id), name(std::move(name)), latitude(latitude), 
          longitude(longitude), elevation_m(elevation), type(std::move(type)) {}

    // Calculate Great-Circle Distance using the Haversine formula (km)
    [[nodiscard]] double distanceTo(const Node& other) const {
        constexpr double DEG_TO_RAD = 3.14159265358979323846 / 180.0;

        const double phi1 = latitude * DEG_TO_RAD;
        const double phi2 = other.latitude * DEG_TO_RAD;
        const double deltaPhi = (other.latitude - latitude) * DEG_TO_RAD;
        const double deltaLambda = (other.longitude - longitude) * DEG_TO_RAD;

        const double sinHalfDeltaPhi = std::sin(deltaPhi / 2.0);
        const double sinHalfDeltaLambda = std::sin(deltaLambda / 2.0);

        const double a = sinHalfDeltaPhi * sinHalfDeltaPhi +
                         std::cos(phi1) * std::cos(phi2) *
                         sinHalfDeltaLambda * sinHalfDeltaLambda;

        // Prevent numerical precision artifacts exceeding [0, 1]
        const double clamped_a = std::clamp(a, 0.0, 1.0);
        const double c = 2.0 * std::atan2(std::sqrt(clamped_a), std::sqrt(1.0 - clamped_a));

        return EARTH_RADIUS_KM * c;
    }
};

} // namespace dsa
