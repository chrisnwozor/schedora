import { Clock, DollarSign, Plus, Scissors } from "lucide-react";

import { ModuleHeader } from "@/components/modules/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  ["Haircut", "$35", "30 min", "Active"],
  ["Fade", "$40", "35 min", "Active"],
  ["Fade + Beard", "$55", "50 min", "Active"],
  ["Beard Trim", "$20", "20 min", "Active"],
  ["Haircut + Beard", "$50", "45 min", "Active"],
];

export default function ServicesPage() {
  return (
    <div>
      <ModuleHeader
        title="Services"
        description="Create services, set pricing, manage durations, and control what customers can book."
        action={
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Plus className="mr-2 size-4" />
            Add service
          </Button>
        }
      />

      <main className="space-y-6 p-6 lg:p-10">
        <section className="grid gap-5 md:grid-cols-3">
          <Summary title="Active services" value="5" />
          <Summary title="Average price" value="$40" />
          <Summary title="Average duration" value="36m" />
        </section>

        <Card className="rounded-2xl border-neutral-200 shadow-none">
          <CardHeader>
            <CardTitle>Service catalog</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div
                key={service[0]}
                className="rounded-2xl border border-neutral-200 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="grid size-11 place-items-center rounded-xl border border-neutral-200">
                    <Scissors className="size-5" />
                  </div>
                  <Badge variant="secondary">{service[3]}</Badge>
                </div>

                <h3 className="mt-5 text-lg font-bold">{service[0]}</h3>

                <div className="mt-5 grid gap-3 text-sm text-neutral-600">
                  <p className="flex items-center gap-2">
                    <DollarSign className="size-4" />
                    {service[1]}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="size-4" />
                    {service[2]}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="outline">Edit</Button>
                  <Button variant="outline">Disable</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Summary({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-2xl border-neutral-200 shadow-none">
      <CardContent className="p-6">
        <p className="text-sm text-neutral-600">{title}</p>
        <p className="mt-3 text-4xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
