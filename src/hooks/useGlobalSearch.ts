import { useEffect, useState } from "react";
import { LawFirmService } from "@/services/lawFirmService";

const removeAccents = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const tokenize = (text: string) =>
  removeAccents(text)
    .split(/[\s\-_.]+/) // separa por espaço, hífen, underline ou ponto
    .filter(Boolean);

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = removeAccents(query);

        const [cases, tasks, clients, appointments, docs] = await Promise.all([
          LawFirmService.getCases(),
          LawFirmService.getTasks(),
          LawFirmService.getClients(),
          LawFirmService.getAppointments(),
          LawFirmService.getDocuments(),
        ]);

        const filtered = [
          ...cases
            .filter((c) => tokenize(c.title).some((t) => t.includes(q)))
            .map((c) => ({ ...c, _type: "case" })),
          ...tasks
            .filter((t) => tokenize(t.title).some((tk) => tk.includes(q)))
            .map((t) => ({ ...t, _type: "task" })),
          ...clients
            .filter((cl) => tokenize(cl.name).some((n) => n.includes(q)))
            .map((cl) => ({ ...cl, _type: "client" })),
          ...appointments
            .filter((a) => tokenize(a.title).some((t) => t.includes(q)))
            .map((a) => ({ ...a, _type: "appointment" })),
          ...docs
            .filter((d) => tokenize(d.name).some((n) => n.includes(q)))
            .map((d) => ({ ...d, _type: "document" })),
        ].slice(0, 20);

        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
}