import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export type FilterType = "search" | "radio" | "checkbox" | "select";

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  configs: FilterConfig[];
}

export const FilterBar = ({ configs }: FilterBarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Debounced Search state
  const [localSearch, setLocalSearch] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    configs
      .filter((c) => c.type === "search")
      .forEach((c) => {
        initial[c.id] = searchParams.get(c.id) || "";
      });
    return initial;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      let changed = false;
      Object.entries(localSearch).forEach(([key, value]) => {
        if (value !== "") {
          // if defined and not empty
          if (newParams.get(key) !== value) {
            newParams.set(key, value);
            changed = true;
          }
        } else {
          if (newParams.has(key)) {
            newParams.delete(key);
            changed = true;
          }
        }
      });
      if (changed) {
        setSearchParams(newParams, { replace: true });
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [localSearch, searchParams, setSearchParams]);

  const handleSearchChange = (id: string, value: string) => {
    setLocalSearch((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (
    id: string,
    value: string,
    checked: boolean,
  ) => {
    const newParams = new URLSearchParams(searchParams);
    const existing = newParams.getAll(id);
    if (checked && !existing.includes(value)) {
      newParams.append(id, value);
    } else if (!checked && existing.includes(value)) {
      newParams.delete(id);
      const remaining = existing.filter((v) => v !== value);
      remaining.forEach((v) => newParams.append(id, v));
    }
    setSearchParams(newParams);
  };

  const handleRadioChange = (id: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete(id);
    } else {
      newParams.set(id, value);
    }
    setSearchParams(newParams);
  };

  const handleSelectChange = (id: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete(id);
    } else {
      newParams.set(id, value);
    }
    setSearchParams(newParams);
  };

  const clearAll = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {configs.map((config) => {
          if (config.type === "search") {
            return (
              <div key={config.id} className="space-y-2">
                <Label>{config.label}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={config.placeholder || "Search..."}
                    value={localSearch[config.id] ?? ""}
                    onChange={(e) =>
                      handleSearchChange(config.id, e.target.value)
                    }
                    className="pl-9"
                  />
                </div>
              </div>
            );
          }

          if (config.type === "checkbox" && config.options) {
            const selected = searchParams.getAll(config.id);
            return (
              <div key={config.id} className="space-y-2">
                <Label>{config.label}</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {config.options.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={opt.id}
                        checked={selected.includes(opt.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            config.id,
                            opt.value,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={opt.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (config.type === "select" && config.options) {
            const selected = searchParams.get(config.id) || "all";
            return (
              <div key={config.id} className="space-y-2">
                <Label>{config.label}</Label>
                <Select
                  value={selected}
                  onValueChange={(val) => handleSelectChange(config.id, val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={config.placeholder || `All ${config.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {config.options.map((opt) => (
                      <SelectItem key={opt.id} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          if (config.type === "radio" && config.options) {
            const selected = searchParams.get(config.id) || "all";
            return (
              <div key={config.id} className="space-y-2">
                <Label>{config.label}</Label>
                <RadioGroup
                  value={selected}
                  onValueChange={(val) => handleRadioChange(config.id, val)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id={`${config.id}-all`} />
                    <Label
                      htmlFor={`${config.id}-all`}
                      className="font-normal cursor-pointer"
                    >
                      All
                    </Label>
                  </div>
                  {config.options.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={opt.id} />
                      <Label
                        htmlFor={opt.id}
                        className="font-normal cursor-pointer"
                      >
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            );
          }

          return null;
        })}
        <Button variant="outline" className="w-full" onClick={clearAll}>
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
};
