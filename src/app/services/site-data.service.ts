import { Injectable } from '@angular/core';
import {
  Advantage,
  ConstructionPackage,
  NavLink,
  ProcessStep,
  Project,
  ServiceItem,
  SocialLink,
  Stat,
} from '../models/site.models';

@Injectable({ providedIn: 'root' })
export class SiteDataService {
  readonly phone = '+91 98765 43210';
  readonly phoneHref = 'tel:+919876543210';
  readonly whatsappHref = 'https://wa.me/919876543210?text=Hi%20Ganesh%20Homes,%20I%20want%20a%20free%20construction%20consultation.';
  readonly email = 'hello@ganeshhomes.in';

  readonly navLinks: NavLink[] = [
    { label: 'Home', target: 'home' },
    { label: 'About Us', target: 'about' },
    { label: 'Packages', target: 'packages' },
    { label: 'Projects', target: 'projects' },
    { label: 'Services', target: 'services' },
    { label: 'Contact', target: 'contact' },
  ];

  readonly stats: Stat[] = [
    { value: 10, suffix: '+', label: 'Years Experience' },
    { value: 100, suffix: '+', label: 'Homes Built' },
    { value: 50, suffix: '+', label: 'Ongoing Projects' },
    { value: 100, suffix: '%', label: 'Customer Focus' },
  ];

  readonly packages: ConstructionPackage[] = [
    {
      id: 'essential',
      name: 'Essential',
      tagline: 'Quality construction within a practical budget.',
      price: '₹1,799',
      priceNote: '/ Sq.Ft',
      features: [
        'Standard civil construction',
        'Basic finishing & tiling',
        'Local sanitary & electrical brands',
        'Standard M.S. reinforcement',
        '1-year workmanship warranty',
        'Dedicated site engineer',
      ],
      cta: 'Get Estimate',
      highlighted: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      tagline: 'Enhanced specifications for a refined modern home.',
      price: '₹2,099',
      priceNote: '/ Sq.Ft',
      features: [
        'Premium civil construction',
        'Vitrified tiles & modular kitchen',
        'Branded sanitary fittings & wiring',
        'High-strength steel reinforcement',
        'Waterproofing & anti-termite treatment',
        '2-year workmanship warranty',
        'Regular progress reporting',
      ],
      cta: 'Get Estimate',
      highlighted: true,
    },
    {
      id: 'luxury',
      name: 'Luxury',
      tagline: 'Premium materials and bespoke detailing throughout.',
      price: '₹2,499',
      priceNote: '/ Sq.Ft',
      features: [
        'Luxury civil construction',
        'Premium marble / porcelain finishes',
        'International sanitary & lighting brands',
        'Architect-designed facade & interiors',
        'Smart home readiness & home automation',
        '3-year workmanship warranty',
        'Dedicated project manager',
      ],
      cta: 'Get Estimate',
      highlighted: false,
    },
    {
      id: 'custom',
      name: 'Customize',
      tagline: 'Let’s build a plan around your vision.',
      price: 'Let’s Build',
      priceNote: 'Your Plan',
      features: [
        'Completely custom design & layout',
        'Choice of materials & brands',
        'Flexible budget planning',
        'Vastu / feng shui adjustments',
        'Multi-storey & duplex expertise',
        'Design-build consultancy',
      ],
      cta: 'Talk to Us',
      highlighted: false,
    },
  ];

  readonly projects: Project[] = [
    {
      id: 1,
      name: 'Modern Villa',
      location: 'Chennai',
      area: '2,400 Sq.Ft',
      type: 'Individual Villa',
      status: 'Completed',
      image: 'assets/images/projects/project-1.svg',
    },
    {
      id: 2,
      name: 'Contemporary Residence',
      location: 'Tambaram',
      area: '1,850 Sq.Ft',
      type: 'Independent House',
      status: 'Completed',
      image: 'assets/images/projects/project-2.svg',
    },
    {
      id: 3,
      name: 'Luxury Family Home',
      location: 'Sholinganallur',
      area: '3,200 Sq.Ft',
      type: 'Duplex Villa',
      status: 'Ongoing',
      image: 'assets/images/projects/project-3.svg',
    },
    {
      id: 4,
      name: 'Modern Courtyard House',
      location: 'OMR',
      area: '2,100 Sq.Ft',
      type: 'Courtyard Home',
      status: 'Completed',
      image: 'assets/images/projects/project-4.svg',
    },
  ];

  readonly services: ServiceItem[] = [
    {
      title: 'Architectural Design',
      description: '2D plans, elevations and architectural planning tailored to your plot.',
      icon: 'design',
    },
    {
      title: 'Structural Design',
      description: 'Safe and efficient structural engineering built to last.',
      icon: 'structure',
    },
    {
      title: 'Home Construction',
      description: 'Complete residential construction from foundation to finishing.',
      icon: 'construction',
    },
    {
      title: 'Interior Design',
      description: 'Modern interiors tailored to the way you live.',
      icon: 'interior',
    },
    {
      title: 'Electrical & Plumbing',
      description: 'Professional electrical and plumbing execution.',
      icon: 'wiring',
    },
    {
      title: 'Project Management',
      description: 'Transparent supervision and progress tracking at every stage.',
      icon: 'management',
    },
  ];

  readonly advantages: Advantage[] = [
    {
      title: 'Quality First',
      description: 'Premium materials and professional workmanship on every site.',
      icon: 'quality',
    },
    {
      title: 'Transparent Pricing',
      description: 'Clear pricing without unnecessary surprises along the way.',
      icon: 'transparent',
    },
    {
      title: 'Experienced Team',
      description: 'Skilled architects, engineers and construction professionals.',
      icon: 'team',
    },
    {
      title: 'Timely Delivery',
      description: 'Structured project planning and monitoring keeps us on schedule.',
      icon: 'delivery',
    },
    {
      title: 'Complete Solution',
      description: 'Design, approval, construction and finishing under one roof.',
      icon: 'complete',
    },
    {
      title: 'Customer Focus',
      description: 'Regular communication keeps you informed throughout your project.',
      icon: 'customer',
    },
  ];

  readonly processSteps: ProcessStep[] = [
    {
      step: '01',
      title: 'Consultation',
      description: 'Understand your requirements, budget and vision for the home.',
    },
    {
      step: '02',
      title: 'Site Evaluation',
      description: 'Evaluate plot, soil and project-specific requirements.',
    },
    {
      step: '03',
      title: 'Design',
      description: 'Create floor plans, elevations and structural designs.',
    },
    {
      step: '04',
      title: 'Planning & Approval',
      description: 'Finalize drawings, specifications and statutory approvals.',
    },
    {
      step: '05',
      title: 'Construction',
      description: 'Execute construction with regular quality checks.',
    },
    {
      step: '06',
      title: 'Handover',
      description: 'Final inspection and handover of your completed home.',
    },
  ];

  readonly socials: SocialLink[] = [
    { name: 'Instagram', href: 'https://instagram.com' },
    { name: 'Facebook', href: 'https://facebook.com' },
    { name: 'YouTube', href: 'https://youtube.com' },
    { name: 'WhatsApp', href: this.whatsappHref },
  ];
}
