"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = yup.object({
  sqyd_gaj: yup.number().typeError("Enter a valid rate").positive().required("Required"),
  sqm: yup.number().typeError("Enter a valid rate").positive().required("Required"),
  acre: yup.number().typeError("Enter a valid rate").positive().required("Required"),
  states: yup.object(),
});

/** Edit modal for the unit-conversion master table, including the state-wise Bigha override. */
export default function ConversionRatesFormModal({ isOpen, onClose, onSubmit, conversionRates, submitting }) {
  const stateNames = Object.keys(conversionRates.bighaByState);
  const defaultValues = {
    sqyd_gaj: conversionRates.rates.sqyd_gaj,
    sqm: conversionRates.rates.sqm,
    acre: conversionRates.rates.acre,
    states: Object.fromEntries(stateNames.map((s) => [s, conversionRates.bighaByState[s]])),
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function submit(values) {
    onSubmit({
      rates: { sqyd_gaj: values.sqyd_gaj, sqm: values.sqm, acre: values.acre },
      bighaByState: values.states,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Edit Unit Conversion Master Table"
      description="All rates convert into Sq. Ft (the base unit). Bigha has no fixed national size, so it's set per state."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} loading={submitting}>
            Save Rates
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">1 unit = how many Sq. Ft</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Sq. Yard (Gaj)" type="number" step="any" required error={errors.sqyd_gaj?.message} {...register("sqyd_gaj")} />
            <Input label="Sq. Meter" type="number" step="any" required error={errors.sqm?.message} {...register("sqm")} />
            <Input label="Acre" type="number" step="any" required error={errors.acre?.message} {...register("acre")} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">1 Bigha = how many Sq. Ft, by state</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {stateNames.map((state) => (
              <Input key={state} label={state} type="number" step="any" required error={errors.states?.[state]?.message} {...register(`states.${state}`)} />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
