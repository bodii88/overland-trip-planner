import React from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb, MapPin, Info } from 'lucide-react';

interface Props {
    markdown: string;
}

export const AIReportRenderer: React.FC<Props> = ({ markdown }) => {
    // Parse the markdown into sections
    const sections = parseMarkdownSections(markdown);

    return (
        <div className="space-y-4">
            {sections.map((section, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50 backdrop-blur-sm">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-4">
                        {getSectionIcon(section.title)}
                        <h4 className="text-lg font-bold text-white">{section.title}</h4>
                    </div>

                    {/* Section Content */}
                    <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
                        {section.content.map((item, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                </div>
                                <div className="flex-1">
                                    {formatContent(item)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Helper function to get the appropriate icon for each section
function getSectionIcon(title: string) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('fact') || lowerTitle.includes('check')) {
        return <CheckCircle2 size={22} className="text-green-400" />;
    }
    if (lowerTitle.includes('tip')) {
        return <Lightbulb size={22} className="text-yellow-400" />;
    }
    if (lowerTitle.includes('recommend')) {
        return <MapPin size={22} className="text-purple-400" />;
    }
    if (lowerTitle.includes('warning') || lowerTitle.includes('caution')) {
        return <AlertTriangle size={22} className="text-orange-400" />;
    }
    return <Info size={22} className="text-blue-400" />;
}

// Parse markdown into structured sections
function parseMarkdownSections(markdown: string): Array<{ title: string; content: string[] }> {
    const sections: Array<{ title: string; content: string[] }> = [];
    const lines = markdown.split('\n');

    let currentSection: { title: string; content: string[] } | null = null;

    for (const line of lines) {
        const trimmed = line.trim();

        // Check if it's a heading (## or **heading**)
        if (trimmed.startsWith('##')) {
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                title: trimmed.replace(/^##\s*/, '').replace(/\*\*/g, ''),
                content: []
            };
        } else if (trimmed.match(/^\*\*[^*]+\*\*:?$/)) {
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                title: trimmed.replace(/\*\*/g, '').replace(/:$/, ''),
                content: []
            };
        } else if (trimmed && currentSection) {
            // Add content to current section
            const cleanLine = trimmed.replace(/^[-*]\s*/, ''); // Remove bullet points
            if (cleanLine) {
                currentSection.content.push(cleanLine);
            }
        }
    }

    if (currentSection) {
        sections.push(currentSection);
    }

    return sections;
}

// Format content with bold text support
function formatContent(text: string): React.ReactNode {
    // Split by ** for bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} className="text-white font-semibold">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return <span key={index}>{part}</span>;
    });
}
