import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDietHistory, setCurrentPlan } from "../../store/diet";
import { useNavigate } from "react-router-dom";

const DietHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans } = useSelector((state) => state.diet);

  useEffect(() => {
    dispatch(fetchDietHistory());
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-black mb-6">
          Your Diet Plans
        </h2>

        <div className="grid gap-4">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer"
              onClick={() => {
                dispatch(setCurrentPlan(plan));
                navigate(`/user/diet/${plan._id}`);
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-black">
                    {plan.profile.goal}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span className="text-orange-500 font-semibold">
                  View →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DietHistory;