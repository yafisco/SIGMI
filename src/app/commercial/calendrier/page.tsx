'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Video, MapPin, Phone, Mail } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/AnimatedCard';

const typeIcons: Record<string, any> = {
  réunion: Video,
  appel: Phone,
  visite: MapPin,
  email: Mail,
  autre: Clock,
};

const typeColors: Record<string, string> = {
  réunion: 'bg-purple-100 text-purple-700',
  appel: 'bg-green-100 text-green-700',
  visite: 'bg-orange-100 text-orange-700',
  email: 'bg-blue-100 text-blue-700',
  autre: 'bg-slate-100 text-slate-700',
};

// Données simulées pour le calendrier (à remplacer par Supabase une fois la table créée)
const simulatedEvents = [
  { id: '1', titre: 'Réunion client GMI', type: 'réunion', date_debut: new Date().toISOString(), lieu: 'Bureau' },
  { id: '2', titre: 'Appel prospect TechCorp', type: 'appel', date_debut: new Date(Date.now() + 86400000).toISOString(), lieu: 'Téléphone' },
  { id: '3', titre: 'Visite site Dakar', type: 'visite', date_debut: new Date(Date.now() + 172800000).toISOString(), lieu: 'Dakar' },
  { id: '4', titre: 'Présentation devis', type: 'réunion', date_debut: new Date(Date.now() + 259200000).toISOString(), lieu: 'Visio' },
  { id: '5', titre: 'Email de suivi', type: 'email', date_debut: new Date(Date.now() + 345600000).toISOString(), lieu: '' },
];

export default function CalendrierPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (direction === 'next' ? 1 : -1),
      1
    ));
  };

  // Filtrer les événements du mois courant
  const evenementsDuMois = simulatedEvents.filter((evt) => {
    const evtDate = new Date(evt.date_debut);
    return (
      evtDate.getMonth() === currentDate.getMonth() &&
      evtDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Événements à venir (7 prochains jours)
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);

  const upcomingEvents = simulatedEvents
    .filter((evt) => {
      const evtDate = new Date(evt.date_debut);
      return evtDate >= today && evtDate <= sevenDaysLater;
    })
    .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime())
    .slice(0, 5);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50 rounded-lg" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = evenementsDuMois.filter((evt) => {
      const evtDate = new Date(evt.date_debut);
      return evtDate.getDate() === day;
    });

    days.push(
      <motion.div
        key={day}
        whileHover={{ scale: 1.02 }}
        className={`h-24 bg-white rounded-lg border border-slate-200 p-2 cursor-pointer hover:border-blue-300 transition-all ${dayEvents.length > 0 ? 'bg-blue-50' : ''}`}
      >
        <div className="text-sm font-medium text-slate-900 mb-1">{day}</div>
        {dayEvents.length > 0 && (
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((evt) => (
              <div key={evt.id} className={`text-xs px-2 py-1 rounded truncate ${typeColors[evt.type] || typeColors.autre}`}>
                {evt.titre}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-slate-500">+{dayEvents.length - 2} autres</div>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  const stats = {
    totalMois: evenementsDuMois.length,
    reunions: evenementsDuMois.filter((e) => e.type === 'réunion').length,
    visites: evenementsDuMois.filter((e) => e.type === 'visite').length,
    appels: evenementsDuMois.filter((e) => e.type === 'appel').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Calendrier"
        description="Gérez vos rendez-vous et événements"
        actionHref="/commercial/calendrier/create"
        actionLabel="Nouvel événement"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Événements ce mois"
            value={stats.totalMois}
            icon={CalendarIcon}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Réunions planifiées"
            value={stats.reunions}
            icon={Video}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.1}
          />
          <StatCard
            title="Visites prévues"
            value={stats.visites}
            icon={MapPin}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.2}
          />
          <StatCard
            title="Appels à faire"
            value={stats.appels}
            icon={Phone}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days}
            </div>
          </div>

          {/* Événements à venir */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Événements à venir (7 jours)</h2>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-slate-500 text-sm">Aucun événement à venir</p>
              ) : (
                upcomingEvents.map((event, index) => {
                  const Icon = typeIcons[event.type] || typeIcons.autre;
                  const eventDate = new Date(event.date_debut);
                  const time = eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  const date = eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${typeColors[event.type]?.split(' ')[0] || 'bg-slate-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{event.titre}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-3 h-3" />
                            {date} à {time}
                          </div>
                          {event.lieu && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                              <MapPin className="w-3 h-3" />
                              {event.lieu}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <Button className="w-full mt-6 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel événement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
