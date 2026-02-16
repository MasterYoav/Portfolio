import Hero from "@/components/Hero";
import ProjectsSection from "@/components/ProjectsModal";
import ContactSection from "@/components/ContactModal";
import ProjectsModal from "@/components/ProjectsModal";

export default function Page() {
  return (
    <>
      <Hero />

      <section id="projects">
        <ProjectsModal />
      </section>

      <section id="contact">
        <ContactSection />
      </section>
    </>
  );
}
