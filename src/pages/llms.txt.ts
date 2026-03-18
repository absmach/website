import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = () => {
  const body = `# Abstract Machines

Open-source IoT platform and edge computing company. Builds Magistrala (IoT platform), Propeller (WebAssembly orchestrator), FluxMQ (message broker), and RISC-V edge gateways.

## Products
- [Magistrala](https://magistrala.absmach.eu/): Open-source IoT platform for device management, identity, and event-driven connectivity.
- [Propeller](https://propeller.absmach.eu/): WebAssembly orchestrator for cloud and edge workloads.
- [FluxMQ](https://fluxmq.absmach.eu/): Distributed message broker supporting real-time communication.
- [S0 Gateway](https://www.absmach.eu/products/s0-gateway/): RISC-V edge gateway for secure IoT devices.
- [S1 Gateway](https://www.absmach.eu/products/s1-gateway/): Advanced RISC-V edge gateway with enhanced performance.

## Documentation & Resources
- [Blog](https://www.absmach.eu/blog/): Technical updates, product releases, and IoT deep-dive articles.
- [Projects](https://www.absmach.eu/projects/): EU Horizon-funded research projects and collaborations.

## Contact & Info
- Website: https://www.absmach.eu/
- Twitter: https://twitter.com/absmach
- LinkedIn: https://www.linkedin.com/company/absmach
- GitHub: https://github.com/absmach
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
