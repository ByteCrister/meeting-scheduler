import { motion } from 'framer-motion';
import { NumberTicker } from '../magicui/number-ticker';
import { CalendarCheck, Clock, UserPlus, Users } from 'lucide-react';
import { JSX } from 'react';

const iconMap: { [key: string]: JSX.Element } = {
    Followers: <Users className="text-blue-500" size={28} />,
    Following: <UserPlus className="text-purple-500" size={28} />,
    'Booked Meetings': <CalendarCheck className="text-green-500" size={28} />,
    'Created Slots': <Clock className="text-yellow-500" size={28} />,
};

const StatCard = ({ title, value }: { title: string; value: number }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-lg p-6 flex flex-col items-center gap-3 transition-all duration-300"
    >
        <div className="bg-gray-100 p-3 rounded-full shadow-md">
            {iconMap[title] || <Users className="text-gray-400" size={28} />}
        </div>
        <h3 className="text-3xl font-bold text-gray-800"><NumberTicker value={value} /></h3>
        <p className="text-gray-600 text-sm font-medium tracking-wide">{title}</p>
    </motion.div>
);

export default StatCard;