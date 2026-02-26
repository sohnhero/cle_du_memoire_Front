const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/dashboard/layout.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace Lucide imports
const newImports = `import {
    SquaresFour as LayoutDashboard, BookOpen, FileText, ChatCircle as MessageCircle, User, Gear as Settings,
    Users, ChartBar as BarChart3, ShieldCheck as Shield, SignOut as LogOut, CaretLeft as ChevronLeft, Bell, MagnifyingGlass as Search,
    List as Menu, X, GraduationCap, Package, Activity, CaretDown as ChevronDown, CalendarBlank as CalendarDays
} from '@phosphor-icons/react';
import { BrandIcon } from '@/components/BrandIcon';`;

content = content.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, newImports);

// Find navigation mapping and replace basic instantiation with BrandIcon mapping
// We need to find the <Icon className="..." /> inside the sidebar navigation mapping

content = content.replace(
    /\{<item\.icon className={`w-5 h-5 shrink-0 transition-colors duration-200 \${isActive \? 'text-accent' : 'text-white\/60 group-hover:text-white'}`} \/>\}/g,
    '{<BrandIcon icon={item.icon} size={32} iconClassName={isActive ? "!text-primary" : "text-white group-hover:!text-primary transition-colors"} className={isActive ? "bg-accent" : "bg-white/10 group-hover:bg-accent transition-colors"} />}'
);

content = content.replace(
    /<item\.icon className={`w-[22px] h-[22px] shrink-0 \${isActive \? 'text-accent' : 'text-text-muted group-hover:text-primary'}`} \/>/g,
    '<BrandIcon icon={item.icon} size={36} iconClassName={isActive ? "!text-primary" : "text-white"} className={isActive ? "bg-accent shadow-md" : "bg-primary"} />'
);

fs.writeFileSync(file, content);
console.log("Updated layout.tsx icons");
