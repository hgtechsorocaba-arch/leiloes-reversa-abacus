'use client';

import { Lance, User } from '@prisma/client';
import { motion } from 'framer-motion';
import { formatarMoeda } from '@/lib/utils-extra';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LanceHistoryProps {
  lances: (Lance & { user: Pick<User, 'name' | 'email'> })[];
}

export function LanceHistory({ lances }: LanceHistoryProps) {
  if (!lances?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Histórico de Lances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Ainda não há lances neste lote.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Histórico de Lances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {lances.map((lance, index) => (
            <motion.div
              key={lance.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2c5282] flex items-center justify-center text-white">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {lance.user?.name ?? 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(lance.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-[#2c5282]">
                  {formatarMoeda(lance.valor)}
                </p>
                {index === 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    Maior lance
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
