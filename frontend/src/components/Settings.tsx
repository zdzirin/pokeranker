import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ArrowBigRight,
  CircleOff,
  ClipboardPaste,
  Copy,
  Dices,
  RotateCcw,
  SettingsIcon,
} from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";

type VectorStrengths = {
  image: number;
  pokedex: number;
  size: number;
  types: number;
  egg_groups: number;
  color: number;
  habitat: number;
  shape: number;
  evolution_chain: number;
  booleans: number;
  stats: number;
};

type SettingsProps = {
  algorithm: string;
  onAlgorithmChange: (value: string) => void;
  k: number;
  onKChange: (value: number) => void;
  vectorStrengths: VectorStrengths;
  defaultStrengths: VectorStrengths;
  onVectorStrengthsChange: (strengths: VectorStrengths) => void;
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function Settings({
  algorithm,
  onAlgorithmChange,
  k,
  onKChange,
  vectorStrengths,
  defaultStrengths,
  onVectorStrengthsChange,
}: SettingsProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  const resetToDefaults = () => {
    onVectorStrengthsChange(defaultStrengths);
  };

  const setAllToNone = () => {
    const zeroStrengths = Object.keys(vectorStrengths).reduce((acc, key) => {
      acc[key as keyof VectorStrengths] = 0;
      return acc;
    }, {} as VectorStrengths);
    onVectorStrengthsChange(zeroStrengths);
  };

  const randomizeStrengths = () => {
    const randomStrengths = Object.keys(vectorStrengths).reduce((acc, key) => {
      const strength =
        Math.random() * (key === "text" || key === "image" ? 1 : 2);
      acc[key as keyof VectorStrengths] = strength;
      return acc;
    }, {} as VectorStrengths);
    onVectorStrengthsChange(randomStrengths);
  };

  const exportSettingsToClipboard = () => {
    const settings = {
      algorithm,
      k,
      vectorStrengths,
    };
    const settingsString = JSON.stringify(settings, null, 2);
    navigator.clipboard.writeText(settingsString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const importSettingsFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      const importedSettings = JSON.parse(text);

      if (
        importedSettings.algorithm &&
        ["euclidean", "cosine"].includes(importedSettings.algorithm)
      ) {
        onAlgorithmChange(importedSettings.algorithm);
      }

      if (
        importedSettings.k &&
        [10, 20, 30, 40, 50].includes(importedSettings.k)
      ) {
        onKChange(importedSettings.k);
      }

      if (
        importedSettings.vectorStrengths &&
        typeof importedSettings.vectorStrengths === "object"
      ) {
        const defaultKeys = Object.keys(defaultStrengths);
        const importedKeys = Object.keys(importedSettings.vectorStrengths);
        const allKeysMatch =
          defaultKeys.length === importedKeys.length &&
          defaultKeys.every(
            (key) =>
              importedKeys.includes(key) &&
              typeof importedSettings.vectorStrengths[key] === "number",
          );

        if (allKeysMatch) {
          onVectorStrengthsChange(importedSettings.vectorStrengths);
        }
      }
    } catch (error) {
      console.error("Failed to import settings from clipboard:", error);
      // Optionally, add user feedback about the error
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="md:w-96 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure the similarity search.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="mb-2">Algorithm</Label>
              <Select onValueChange={onAlgorithmChange} value={algorithm}>
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Select an algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="euclidean">
                      Euclidean Distance
                    </SelectItem>
                    <SelectItem value="cosine">Cosine Similarity</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="w-fit">
              <Label className="mb-2">Query Size</Label>
              <Select
                onValueChange={(value) => onKChange(Number(value))}
                value={String(k)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select a number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <h5 className="font-medium mb-2">Manage Settings</h5>
            <div className="flex gap-2 mb-2">
              <Button
                variant="outline"
                onClick={exportSettingsToClipboard}
                className="flex-1"
              >
                <Copy />
                {isCopied ? "Copied!" : "Export"}
              </Button>
              <Button
                variant="outline"
                onClick={importSettingsFromClipboard}
                className="flex-1"
              >
                <ClipboardPaste />
                Import
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="muted" onClick={resetToDefaults}>
                <RotateCcw /> Reset
              </Button>
              <Button variant="muted" size="icon" onClick={randomizeStrengths}>
                <Dices />
              </Button>
              <Button variant="outline" onClick={setAllToNone}>
                <CircleOff /> Clear
              </Button>
              <DialogClose className="flex-1">
                <Button className="w-full">
                  Go <ArrowBigRight />
                </Button>
              </DialogClose>
            </div>
          </div>
          <div>
            <h5 className="font-medium mb-2">Vector Strengths</h5>
            <div className="space-y-4">
              {Object.entries(vectorStrengths).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">
                      {capitalize(key.replace("_", " "))}
                    </Label>
                    <Input
                      type="number"
                      step={key === "image" || key === "text" ? "0.025" : "0.1"}
                      min="0"
                      max={key === "image" || key === "text" ? "1" : "2"}
                      value={value}
                      onChange={(e) =>
                        onVectorStrengthsChange({
                          ...vectorStrengths,
                          [key]: Number(e.target.value),
                        })
                      }
                      className="w-20 h-8 text-xs"
                    />
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={([newValue]) =>
                      onVectorStrengthsChange({
                        ...vectorStrengths,
                        [key]: newValue,
                      })
                    }
                    min={0}
                    max={key === "image" || key === "text" ? 1 : 2}
                    step={key === "image" || key === "text" ? 0.025 : 0.1}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
