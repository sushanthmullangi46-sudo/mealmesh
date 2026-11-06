#pragma once

#include "Types.hpp"
#include <string>
#include <algorithm>

namespace dsa {

class Edge {
public:
    std::string id;
    NodeId source{0};
    NodeId target{0};
    double distance_km{0.0};
    double speed_limit_kmh{50.0};
    TrafficLevel traffic_level{TrafficLevel::LOW};
    double custom_multiplier{1.0};
    double toll_cost{0.0};
    bool is_one_way{false};
    std::string road_name{"Road"};
    std::string road_type{"primary"};

    // Cost modeling parameters:
    // Average fuel price per km: ~$0.15/km
    // Value of driver time: ~$0.30/minute
    static constexpr double FUEL_COST_PER_KM = 0.15;
    static constexpr double TIME_VALUE_PER_MIN = 0.30;

    Edge() = default;

    Edge(std::string id, NodeId source, NodeId target, double distance_km,
         double speed_limit = 50.0, TrafficLevel traffic = TrafficLevel::LOW,
         double toll = 0.0, bool one_way = false, 
         std::string name = "Road", std::string type = "primary")
        : id(std::move(id)), source(source), target(target),
          distance_km(std::max(0.001, distance_km)),
          speed_limit_kmh(std::max(5.0, speed_limit)),
          traffic_level(traffic),
          custom_multiplier(trafficToMultiplier(traffic)),
          toll_cost(std::max(0.0, toll)),
          is_one_way(one_way),
          road_name(std::move(name)),
          road_type(std::move(type)) {}

    void setTrafficLevel(TrafficLevel level) {
        traffic_level = level;
        custom_multiplier = trafficToMultiplier(level);
    }

    [[nodiscard]] double getEffectiveSpeedKmh() const {
        if (traffic_level == TrafficLevel::BLOCKED) {
            return 0.0;
        }
        const double mult = (custom_multiplier > 0.0) ? custom_multiplier : 1.0;
        return speed_limit_kmh / mult;
    }

    [[nodiscard]] double getTravelTimeMinutes() const {
        if (traffic_level == TrafficLevel::BLOCKED) {
            return INF_WEIGHT;
        }
        const double effectiveSpeed = getEffectiveSpeedKmh();
        if (effectiveSpeed <= 0.0) return INF_WEIGHT;
        return (distance_km / effectiveSpeed) * 60.0;
    }

    [[nodiscard]] double getMonetaryCost() const {
        if (traffic_level == TrafficLevel::BLOCKED) {
            return INF_WEIGHT;
        }
        const double fuelCost = distance_km * FUEL_COST_PER_KM;
        const double timeCost = getTravelTimeMinutes() * TIME_VALUE_PER_MIN;
        return fuelCost + toll_cost + timeCost;
    }

    [[nodiscard]] double getWeight(OptimizationObjective obj) const {
        if (traffic_level == TrafficLevel::BLOCKED) {
            return INF_WEIGHT;
        }
        switch (obj) {
            case OptimizationObjective::DISTANCE:
                return distance_km;
            case OptimizationObjective::TIME:
                return getTravelTimeMinutes();
            case OptimizationObjective::COST:
                return getMonetaryCost();
            default:
                return distance_km;
        }
    }
};

} // namespace dsa

