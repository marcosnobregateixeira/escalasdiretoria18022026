import { Soldier, Roster, AppSettings, User, Rank, Role, Status, RosterCategory, ExtraDutyHistory, Cadre } from '../types';
import { supabase } from './supabase';

const INITIAL_CATEGORIES: RosterCategory[] = [
  { id: 'cat_amb', name: 'Ambulância', icon: 'Truck' },
  { id: 'cat_psi', name: 'Psicologia', icon: 'Brain' },
  { id: 'cat_ast', name: 'Assistencial', icon: 'HeartPulse' },
  { id: 'cat_adm', name: 'Administrativo', icon: 'Briefcase' },
  { id: 'cat_extra', name: 'Escala Extra / Voluntária', icon: 'Star' }
];

const INITIAL_SETTINGS: AppSettings = {
  orgName: 'DIRETORIA DE SAÚDE – PMCE',
  directorName: 'FRANCISCO ÉLITON ARAÚJO',
  directorRank: 'Cel PM',
  directorRole: 'Diretor de Saúde - DS/PMCE',
  directorMatricula: 'M.F 108.819-1-9',
  shiftCycleRefDate: '2024-01-01',
  logoLeft: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Bras%C3%A3o_da_Pol%C3%ADcia_Militar_do_Cear%C3%A1.png/240px-Bras%C3%A3o_da_Pol%C3%ADcia_Militar_do_Cear%C3%A1.png',
  logoRight: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Bras%C3%A3o_do_Cear%C3%A1.svg/200px-Bras%C3%A3o_do_Cear%C3%A1.svg.png',
  showLogoLeft: true,
  showLogoRight: true,
  city: 'Fortaleza-CE',
  showPhoneInPrint: true,
  rosterCategories: INITIAL_CATEGORIES
};

const INITIAL_SOLDIERS: Soldier[] = [
  { id: '1', name: 'Cruz', rank: Rank.SUBTEN, cadre: Cadre.QOPPM, role: Role.FISCAL_MOTORISTA, roleShort: '(F.M)', sector: 'Ambulância', team: 'ALFA', status: Status.ATIVO, phone: '98651.4680', availableForExtra: true, orderExtra: 1 },
  { id: '2', name: 'Virginia', rank: Rank.TEN_1, cadre: Cadre.QOAPM, role: Role.FISCAL, roleShort: '(F)', sector: 'Ambulância', team: 'BRAVO', status: Status.ATIVO, phone: '88 99335.6947', availableForExtra: true, orderExtra: 2 },
  { id: '3', name: 'Ricardo', rank: Rank.SGT_1, cadre: Cadre.QOPPM, role: Role.FISCAL, roleShort: '(F)', sector: 'Ambulância', team: 'CHARLIE', status: Status.ATIVO, matricula: '20126', phone: '98838-4022', availableForExtra: true, orderExtra: 3 },
  { id: '20', name: 'Maria', rank: Rank.SD, cadre: Cadre.QOPPM, role: Role.ENFERMEIRO, roleShort: '(1)', sector: 'Ambulância', team: 'TURMA 01', status: Status.ATIVO, matricula: '36.113', phone: '98180-1288', availableForExtra: true, orderExtra: 4 }
];

class StoreService {
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // ─── AUTH ──────────────────────────────────────────────────────────────────

  login(password: string): User | null {
    if (password === '123') {
      const admin: User = { username: 'admin', role: 'ADMIN' };
      localStorage.setItem('currentUser', JSON.stringify(admin));
      return admin;
    }
    if (password === '321') {
      const user: User = { username: 'user', role: 'USER' };
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  }

  getAdminPassword(): string {
    return '123'; // Senha padrão ou recuperar de env/banco se necessário
  }

  getCurrentUser(): User {
    const stored = localStorage.getItem('currentUser');
    if (stored) return JSON.parse(stored);
    return { username: 'Visitante', role: 'USER' };
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  // ─── SETTINGS ──────────────────────────────────────────────────────────────

  async getSettings(): Promise<AppSettings> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          await this.saveSettings(INITIAL_SETTINGS);
          return INITIAL_SETTINGS;
        }
        throw error;
      }

      // Map snake_case to camelCase
      return {
        orgName: data.org_name,
        directorName: data.director_name,
        directorRank: data.director_rank,
        directorRole: data.director_role,
        directorMatricula: data.director_matricula,
        shiftCycleRefDate: data.shift_cycle_ref_date,
        logoLeft: data.logo_left,
        logoRight: data.logo_right,
        showLogoLeft: data.show_logo_left,
        showLogoRight: data.show_logo_right,
        city: data.city,
        showPhoneInPrint: data.show_phone_in_print,
        rosterCategories: data.roster_categories || []
      };
    } catch (e: any) {
      console.error('Erro ao buscar settings no Supabase:', e);
      return INITIAL_SETTINGS;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          id: 'main',
          org_name: settings.orgName,
          director_name: settings.directorName,
          director_rank: settings.directorRank,
          director_role: settings.directorRole,
          director_matricula: settings.directorMatricula,
          shift_cycle_ref_date: settings.shiftCycleRefDate,
          logo_left: settings.logoLeft,
          logo_right: settings.logoRight,
          show_logo_left: settings.showLogoLeft,
          show_logo_right: settings.showLogoRight,
          city: settings.city,
          show_phone_in_print: settings.showPhoneInPrint,
          roster_categories: settings.rosterCategories
        });

      if (error) throw error;
      this.notify();
    } catch (e: any) {
      console.error('Erro ao salvar settings no Supabase:', e);
      alert('Erro ao salvar configurações no Supabase: ' + (e.message || ''));
    }
  }

  // ─── SOLDIERS ───────────────────────────────────────────────────────────────

  async getSoldiers(): Promise<Soldier[]> {
    try {
      const { data, error } = await supabase
        .from('soldiers')
        .select('*');

      if (error) {
        console.error('Erro detalhado Supabase (get):', error);
        alert('Erro ao carregar militares: ' + error.message);
        return []; // Retorna vazio em vez de INITIAL_SOLDIERS para não confundir
      }

      if (!data || data.length === 0) {
        console.log('Nenhum dado encontrado no Supabase.');
        return [];
      }

      console.log('Dados carregados com sucesso do Supabase:', data.length, 'militares');
      return data.map(d => ({
        id: d.id,
        name: d.name,
        fullName: d.full_name,
        rank: d.rank,
        cadre: d.cadre,
        matricula: d.matricula,
        mf: d.mf,
        phone: d.phone,
        sector: d.sector,
        team: d.team,
        role: d.role,
        roleShort: d.role_short,
        status: d.status,
        absenceStartDate: d.absence_start_date,
        absenceEndDate: d.absence_end_date,
        folgaReason: d.folga_reason,
        bankHistory: d.bank_history || [],
        orderExtra: d.order_extra,
        availableForExtra: d.available_for_extra
      }));
    } catch (e: any) {
      console.error('Erro de conexão com Supabase:', e);
      alert('Erro de conexão: Verifique seu arquivo .env.local e se o Supabase está ativo.');
      return [];
    }
  }

  async saveSoldier(soldier: Soldier): Promise<void> {
    try {
      const { error } = await supabase
        .from('soldiers')
        .upsert({
          id: soldier.id,
          name: soldier.name,
          full_name: soldier.fullName,
          rank: soldier.rank,
          cadre: soldier.cadre,
          matricula: soldier.matricula,
          mf: soldier.mf,
          phone: soldier.phone,
          sector: soldier.sector,
          team: soldier.team,
          role: soldier.role,
          role_short: soldier.roleShort,
          status: soldier.status,
          absence_start_date: soldier.absenceStartDate,
          absence_end_date: soldier.absenceEndDate,
          folga_reason: soldier.folgaReason,
          bank_history: soldier.bankHistory,
          order_extra: soldier.orderExtra,
          available_for_extra: soldier.availableForExtra
        });

      if (error) throw error;
      this.notify();
    } catch (e: any) {
      console.error('Erro ao salvar soldier no Supabase:', e);
      alert('Falha ao salvar militar no Supabase: ' + (e.message || ''));
    }
  }

  async deleteSoldier(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('soldiers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      this.notify();
    } catch (e: any) {
      console.error('Erro ao deletar soldier no Supabase:', e);
    }
  }

  // ─── ROSTERS ────────────────────────────────────────────────────────────────

  async getRosters(): Promise<Roster[]> {
    try {
      const { data, error } = await supabase
        .from('rosters')
        .select('*');

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        type: d.type,
        title: d.title,
        headerTitle: d.header_title,
        subTitle: d.sub_title,
        month: d.month,
        year: d.year,
        startDate: d.start_date,
        endDate: d.end_date,
        creationDate: d.creation_date,
        shifts: d.shifts || [],
        observations: d.observations || '',
        observationsTitle: d.observations_title,
        situationText: d.situation_text,
        isPublished: d.is_published,
        sections: d.sections,
        customHeaders: d.custom_headers
      }));
    } catch (e: any) {
      console.error('Erro ao buscar rosters no Supabase:', e);
      return [];
    }
  }

  async saveRoster(roster: Roster): Promise<void> {
    try {
      const { error } = await supabase
        .from('rosters')
        .upsert({
          id: roster.id,
          type: roster.type,
          title: roster.title,
          header_title: roster.headerTitle,
          sub_title: roster.subTitle,
          month: roster.month,
          year: roster.year,
          start_date: roster.startDate,
          end_date: roster.endDate,
          creation_date: roster.creationDate,
          shifts: roster.shifts,
          observations: roster.observations,
          observations_title: roster.observationsTitle,
          situation_text: roster.situationText,
          is_published: roster.isPublished,
          sections: roster.sections,
          custom_headers: roster.customHeaders
        });

      if (error) throw error;
      this.notify();
    } catch (e: any) {
      console.error('Erro ao salvar roster no Supabase:', e);
      alert('Falha ao salvar escala no Supabase: ' + (e.message || ''));
    }
  }

  async deleteRoster(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rosters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      this.notify();
    } catch (e: any) {
      console.error('Erro ao deletar roster no Supabase:', e);
      alert('Falha ao deletar escala no Supabase: ' + (e.message || ''));
    }
  }

  // ─── THEME ─────────────────────────────────────────────────────────────────

  setTheme(isDark: boolean) {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  getTheme(): boolean {
    return localStorage.getItem('theme') === 'dark';
  }

  // ─── EXTRA DUTY HISTORY ─────────────────────────────────────────────────────

  async getExtraDutyHistory(): Promise<ExtraDutyHistory[]> {
    try {
      const { data, error } = await supabase
        .from('extra_duty_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        date: d.date,
        rosterDate: d.roster_date,
        soldierNames: d.soldier_names || [],
        amount: d.amount
      }));
    } catch (e: any) {
      console.error('Erro ao buscar histórico extra no Supabase:', e);
      return [];
    }
  }

  async saveExtraDutyHistory(history: ExtraDutyHistory): Promise<void> {
    try {
      const { error } = await supabase
        .from('extra_duty_history')
        .upsert({
          id: history.id,
          date: history.date,
          roster_date: history.rosterDate,
          soldier_names: history.soldierNames,
          amount: history.amount
        });

      if (error) throw error;
      this.notify();
    } catch (e: any) {
      console.error('Erro ao salvar histórico extra no Supabase:', e);
      alert('Falha ao salvar histórico no Supabase: ' + (e.message || ''));
    }
  }
}

export const db = new StoreService();