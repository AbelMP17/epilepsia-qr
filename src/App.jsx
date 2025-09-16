import { useEffect, useMemo, useState } from "react";

/**
 * Parámetros soportados por URL para personalizar sin backend:
 * ?nombre=...&apellidos=...&dni=...&condicion=...
 * &alergias=Pe%20ni%20ci%20li%20na,Polen
 * &medicamentos=Valproato%20500mg%20c/12h
 * &contacto=Carlos%20Fernández%20(Padre)
 * &tel=+34600123456
 * &notas=Texto%20libre
 *
 * Ejemplo de URL para QR:
 * https://tudominio.com/?nombre=Luc%C3%ADa&apellidos=Fern%C3%A1ndez%20Soto&dni=12345678Z&tel=%2B34600123456
 */

const DEFAULT_PATIENT = {
  nombre: "Hijo",
  apellidos: "Noseque Cuartero",
  dni: "12345678Z",
  condicion: "Epilepsia (crisis tónico-clónicas)",
  alergias: ["Penicilina"],
  medicamentos: ["Valproato 500 mg cada 12 h"],
  notas:
    "Tras una crisis puede estar desorientada 10–15 min. No forzar incorporación.",
  contacto: {
    nombre: "Ana María Cuartero (Madre)",
    telefono: "+34 600 123 456",
  },
  medico: {
    nombre: "Dra. Marta Ruiz",
    telefono: "+34 910 111 222",
  },
  grupoSanguineo: "O+",
};

function usePatientFromQuery(defaultPatient) {
  return useMemo(() => {
    const p = new URLSearchParams(window.location.search);

    const getList = (key) => {
      const raw = p.get(key);
      if (!raw) return undefined;
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const merged = {
      ...defaultPatient,
      nombre: p.get("nombre") ?? defaultPatient.nombre,
      apellidos: p.get("apellidos") ?? defaultPatient.apellidos,
      dni: p.get("dni") ?? defaultPatient.dni,
      condicion: p.get("condicion") ?? defaultPatient.condicion,
      alergias: getList("alergias") ?? defaultPatient.alergias,
      medicamentos: getList("medicamentos") ?? defaultPatient.medicamentos,
      notas: p.get("notas") ?? defaultPatient.notas,
      contacto: {
        nombre: p.get("contacto") ?? defaultPatient.contacto.nombre,
        telefono: p.get("tel") ?? defaultPatient.contacto.telefono,
      },
      medico: {
        nombre: p.get("medico") ?? defaultPatient.medico.nombre,
        telefono: p.get("telMedico") ?? defaultPatient.medico.telefono,
      },
      grupoSanguineo: p.get("gs") ?? defaultPatient.grupoSanguineo,
    };

    return merged;
  }, [defaultPatient]);
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-24 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="text-base leading-relaxed">{children}</div>
    </div>
  );
}

export default function App() {
  const [highContrast, setHighContrast] = useState(false);
  const patient = usePatientFromQuery(DEFAULT_PATIENT);

  useEffect(() => {
    document.documentElement.style.backgroundColor = highContrast ? "#000" : "";
  }, [highContrast]);

  const telDigits = (patient.contacto.telefono || "").replace(/\s+/g, "");
  const telHref = telDigits ? `tel:${telDigits}` : `tel:112`; // fallback 112
  const smsHref = telDigits
    ? `sms:${telDigits}?&body=${encodeURIComponent(
        "Emergencia. Te contacto por " +
          [patient.nombre, patient.apellidos].filter(Boolean).join(" ")
      )}`
    : `sms:`;

  return (
    <div className={highContrast ? "bg-black text-white" : ""}>
      {/* Header */}
      <header
        className={`w-full ${
          highContrast ? "bg-black" : "bg-emergency-600"
        } text-white`}
      >
        <div className="mx-auto max-w-md px-4 pt-6 pb-4">
          <p className="text-xs opacity-90">Tarjeta de emergencia</p>
          <h1 className="text-2xl font-bold mt-1">
            Epilepsia — Ayuda inmediata
          </h1>

          <div className="mt-3 flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                highContrast ? "bg-white text-black" : "bg-white/90 text-black"
              }`}
            >
              INFO MÉDICA
            </span>

            <button
              onClick={() => setHighContrast((v) => !v)}
              className={`text-xs underline underline-offset-2 ${
                highContrast ? "text-white" : "text-white/90"
              }`}
              aria-pressed={highContrast}
            >
              {highContrast ? "Modo normal" : "Alto contraste"}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-md px-4 pb-40 pt-4">
        {/* Identidad */}
        <section
          className={`rounded-2xl border ${
            highContrast ? "border-white/40" : "border-gray-200"
          } bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white ${
            highContrast ? "!bg-black text-white border-white/40" : "bg-white"
          } p-4 shadow-sm`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`h-16 w-16 shrink-0 rounded-xl ${
                highContrast ? "bg-white/10" : "bg-gray-100"
              } flex items-center justify-center text-2xl`}
              aria-hidden="true"
            >
              🆔
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">
                {[patient.nombre, patient.apellidos].filter(Boolean).join(" ")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                DNI: <span className="font-mono">{patient.dni}</span>
              </p>
              {patient.grupoSanguineo && (
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Grupo sanguíneo:{" "}
                  <span className="font-semibold">
                    {patient.grupoSanguineo}
                  </span>
                </p>
              )}
            </div>
          </div>

          <hr className={highContrast ? "my-4 border-white/20" : "my-4"} />

          <InfoRow label="Condición">
            <p>{patient.condicion}</p>
          </InfoRow>

          <div className={highContrast ? "my-4 border-white/20" : "my-4"}>
            <details
              className="rounded-xl border p-3 text-sm"
              role="group"
            >
              <summary className="cursor-pointer font-semibold">
                Guía rápida (primeros auxilios)
              </summary>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Ponla de lado y despeja la zona.</li>
                <li>No metas nada en su boca ni sujetes con fuerza.</li>
                <li>Cuenta el tiempo de la crisis.</li>
                <li>
                  Llama a emergencias si dura &gt;5 min, se repite, hay lesión
                  o dificultad para respirar.
                </li>
              </ol>
              <p className="mt-2 text-gray-500 dark:text-gray-300">
                Esta información es orientativa. Llama a emergencias si tienes
                dudas.
              </p>
            </details>
          </div>

          <InfoRow label="Alergias">
            <p>
              {patient.alergias?.length
                ? patient.alergias.join(", ")
                : "No registradas"}
            </p>
          </InfoRow>

          <InfoRow label="Medicación">
            <p>
              {patient.medicamentos?.length
                ? patient.medicamentos.join(", ")
                : "No registrada"}
            </p>
          </InfoRow>

          {patient.notas && (
            <InfoRow label="Notas">
              <p>{patient.notas}</p>
            </InfoRow>
          )}

          <div className={highContrast ? "my-4 border-white/20" : "my-4"}>
            <hr />
          </div>

          <InfoRow label="Contacto">
            <div>
              <p className="font-semibold">{patient.contacto.nombre}</p>
              <p className="font-mono">{patient.contacto.telefono}</p>
              <div className="mt-2 flex gap-2">
                <a
                  className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold ${
                    highContrast
                      ? "bg-white text-black"
                      : "bg-gray-900 text-white"
                  }`}
                  href={telHref}
                  role="button"
                >
                  📞 Llamar
                </a>
                <a
                  className={`inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold ${
                    highContrast
                      ? "bg-white text-black"
                      : "bg-gray-200 text-gray-900"
                  }`}
                  href={smsHref}
                  role="button"
                >
                  ✉️ SMS
                </a>
              </div>
            </div>
          </InfoRow>

          <div className={highContrast ? "my-4 border-white/20" : "my-4"}>
            <hr />
          </div>

          <InfoRow label="Médico">
            <div>
              <p>{patient.medico.nombre}</p>
              <a
                className={`underline ${
                  highContrast ? "text-white" : "text-gray-700"
                }`}
                href={
                  patient.medico.telefono
                    ? `tel:${patient.medico.telefono.replace(/\s+/g, "")}`
                    : "#"
                }
              >
                {patient.medico.telefono}
              </a>
            </div>
          </InfoRow>
        </section>

        {/* Aviso de privacidad */}
        <p className="mt-4 text-xs text-gray-500">
          Solo usar esta información para ayudar en una emergencia. No almacenar
          datos ni tomar fotos de la pantalla sin consentimiento.
        </p>
      </main>

      {/* CTA fijo inferior */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t ${
          highContrast ? "bg-black border-white/20" : "bg-white border-gray-200"
        }`}
        style={{ paddingBottom: "calc(16px + var(--safe-bottom))" }}
      >
        <div className="mx-auto max-w-md px-4 pt-3">
          <a
            href={telHref}
            className={`block w-full text-center rounded-2xl px-4 py-4 text-lg font-bold shadow ${
              highContrast
                ? "bg-white text-black"
                : "bg-emergency-600 text-white"
            }`}
            role="button"
            aria-label="Llamar al contacto de emergencia"
          >
            Llamar ahora {telDigits ? "" : "(112)"}
          </a>
          <p
            className={`mt-2 text-center text-xs ${
              highContrast ? "text-white/80" : "text-gray-500"
            }`}
          >
            Si no hay contacto, marca <strong>112</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
