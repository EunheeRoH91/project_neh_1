import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  ShieldCheck, 
  BarChart3, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Search,
  Building2,
  Receipt,
  Lock,
  Info,
  ArrowRight,
  Sparkles,
  Check,
  CheckCheck,
  FileSpreadsheet,
  AlertOctagon,
  CornerDownRight,
  Split,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  FolderOpen,
  UploadCloud,
  Download,
  Trash2,
  FileCheck,
  Play,
  Table,
  Eye
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { supabase } from './lib/supabaseClient';

export type UserRole = 'admin' | 'executive' | 'viewer';

// 오픈마켓 정산 배치용 개별 주문 데이터 규격
export interface DemoSettlementOrder {
  orderKey: string;
  date: string;
  productName: string;
  customer: string;
  grossAmount: number;
  fee: number;
  returnLoss: number;
  damage: number;
  etc: number;
  expectedSettledAmount?: number;
  settledAmount: number;
  diffAmount?: number;
  diffReason?: string;
  status: 'MATCHED' | 'RETURN_DEDUCTED' | 'DAMAGE_RETURN' | 'UNMATCHED_DISPUTE';
}

// 네이버 스마트스토어 10월 정산 배치 개별 주문 리스트 (8건 합계: 매출 4,500만원 / 공제 270만원 / 실지급 4,230만원)
export const NAVER_DEMO_ORDERS: DemoSettlementOrder[] = [
  {
    orderKey: 'ORD-20261015-0101',
    date: '2026-10-15',
    productName: '프리미엄 무선 노이즈캔슬링 헤드셋 Gen2',
    customer: '이*훈',
    grossAmount: 8500000,
    fee: 340000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 8160000,
    status: 'MATCHED'
  },
  {
    orderKey: 'ORD-20261015-0102',
    date: '2026-10-15',
    productName: '기계식 핫스왑 게이밍 키보드 RGB (청축)',
    customer: '박*준',
    grossAmount: 6200000,
    fee: 248000,
    returnLoss: 250000,
    damage: 0,
    etc: 0,
    settledAmount: 5702000,
    status: 'RETURN_DEDUCTED'
  },
  {
    orderKey: 'ORD-20261015-0103',
    date: '2026-10-15',
    productName: '초고속 100W GaN 4포트 멀티충전기',
    customer: '최*민',
    grossAmount: 4800000,
    fee: 192000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 4608000,
    status: 'MATCHED'
  },
  {
    orderKey: 'ORD-20261016-0104',
    date: '2026-10-16',
    productName: '27인치 QHD 165Hz IPS 게이밍 모니터',
    customer: '정*우',
    grossAmount: 9500000,
    fee: 380000,
    returnLoss: 400000,
    damage: 250000,
    etc: 0,
    settledAmount: 8470000,
    status: 'DAMAGE_RETURN'
  },
  {
    orderKey: 'ORD-20261016-0105',
    date: '2026-10-16',
    productName: '인체공학 무선 버티컬 마우스 풀세트',
    customer: '강*지',
    grossAmount: 3600000,
    fee: 144000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 3456000,
    status: 'MATCHED'
  },
  {
    orderKey: 'ORD-20261017-0106',
    date: '2026-10-17',
    productName: '알루미늄 360도 회전형 노트북 거치대 스탠드',
    customer: '윤*호',
    grossAmount: 2400000,
    fee: 96000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 2304000,
    status: 'MATCHED'
  },
  {
    orderKey: 'ORD-20261017-0107',
    date: '2026-10-17',
    productName: '썬더볼트4 8in1 멀티 허브 도킹스테이션',
    customer: '임*서',
    grossAmount: 5500000,
    fee: 220000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 5280000,
    status: 'MATCHED'
  },
  {
    orderKey: 'ORD-20261018-0108',
    date: '2026-10-18',
    productName: '스마트 블루투스 위치추적 태그 4개입',
    customer: '조*현',
    grossAmount: 4500000,
    fee: 180000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 4320000,
    status: 'MATCHED'
  }
];

// 쿠팡 로켓배송 10월 정산 배치 개별 주문 리스트 (8건 합계: 매출 8,126만원 / 공제 490만원 / 정산실지급 7,626만원 ↔ 미수 발생 시 통장실입금 7,500만원)
export const COUPANG_DEMO_ORDERS: DemoSettlementOrder[] = [
  {
    orderKey: 'CP-20261010-0201',
    date: '2026-10-10',
    productName: '로켓 프레시 대용량 공기청정기 필터 세트',
    customer: '송*진',
    grossAmount: 14500000,
    fee: 725000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 13775000,
    status: 'MATCHED'
  },
  {
    orderKey: 'CP-20261010-0202',
    date: '2026-10-10',
    productName: '초경량 카본 삼각대 프로 페셔널 패키지',
    customer: '한*수',
    grossAmount: 13000000,
    fee: 650000,
    returnLoss: 500000,
    damage: 0,
    etc: 0,
    settledAmount: 11850000,
    status: 'RETURN_DEDUCTED'
  },
  {
    orderKey: 'CP-20261011-0203',
    date: '2026-10-11',
    productName: '4K 방송용 스트리밍 웹캠 마이크 세트',
    customer: '오*영',
    grossAmount: 11000000,
    fee: 550000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 10450000,
    status: 'MATCHED'
  },
  {
    orderKey: 'CP-20261011-0204',
    date: '2026-10-11',
    productName: '초고속 대용량 보조배터리 30000mAh 65W',
    customer: '신*호',
    grossAmount: 12000000,
    fee: 600000,
    returnLoss: 400000,
    damage: 0,
    etc: 0,
    settledAmount: 11000000,
    status: 'RETURN_DEDUCTED'
  },
  {
    orderKey: 'CP-20261012-0205',
    date: '2026-10-12',
    productName: '고음질 블루투스 스튜디오 모니터 스피커 페어',
    customer: '문*태',
    grossAmount: 1260000,
    fee: 0,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 1260000,
    status: 'MATCHED'
  },
  {
    orderKey: 'CP-20261012-0206',
    date: '2026-10-12',
    productName: '마그네틱 고속 무선충전 3in1 스탠드 패드',
    customer: '권*나',
    grossAmount: 10000000,
    fee: 500000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 9500000,
    status: 'MATCHED'
  },
  {
    orderKey: 'CP-20261013-0207',
    date: '2026-10-13',
    productName: '인체공학 전동 모션데스크 컨트롤러 세트',
    customer: '황*재',
    grossAmount: 10000000,
    fee: 500000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 9500000,
    status: 'MATCHED'
  },
  {
    orderKey: 'CP-20261013-0208',
    date: '2026-10-13',
    productName: 'USB-C 올인원 멀티포트 허브 프로페셔널',
    customer: '배*윤',
    grossAmount: 9400000,
    fee: 475000,
    returnLoss: 0,
    damage: 0,
    etc: 0,
    settledAmount: 8925000,
    status: 'MATCHED'
  }
];

// 쿠팡 로켓배송 차액 불일치(126만원) 예외 시나리오 주문 리스트
// (주문 CP-20261012-0205는 원장에는 조회되나 고객 정산보류로 쿠팡 정산 엑셀에 내역없음 - 126만원 전액 미수금 발생)
export const COUPANG_MISMATCH_DEMO_ORDERS: DemoSettlementOrder[] = COUPANG_DEMO_ORDERS.map(ord => {
  if (ord.orderKey === 'CP-20261012-0205') {
    return {
      ...ord,
      fee: 0,
      returnLoss: 0,
      damage: 0,
      etc: 0,
      expectedSettledAmount: 1260000,
      settledAmount: 0,
      diffAmount: -1260000,
      diffReason: '내역없음',
      status: 'UNMATCHED_DISPUTE'
    };
  }
  return {
    ...ord,
    expectedSettledAmount: ord.settledAmount,
    diffAmount: 0
  };
});

// 개별 주문 품목 및 주문자명 메타데이터 매핑
export const ORDER_METADATA_MAP: Record<string, { product_name: string; buyer_name: string }> = {
  ...NAVER_DEMO_ORDERS.reduce((acc, cur) => {
    acc[cur.orderKey] = { product_name: cur.productName, buyer_name: cur.customer };
    return acc;
  }, {} as Record<string, { product_name: string; buyer_name: string }>),
  ...COUPANG_DEMO_ORDERS.reduce((acc, cur) => {
    acc[cur.orderKey] = { product_name: cur.productName, buyer_name: cur.customer };
    return acc;
  }, {} as Record<string, { product_name: string; buyer_name: string }>),
  'ORD-20261018-007': { product_name: '스마트 오피스 데스크 무선 충전 패드', buyer_name: '장*희' },
  'ORD-20261020-008': { product_name: '게이밍 스트리머 링라이트 삼각대 풀세트', buyer_name: '서*진' },
  'INV-20261005-003': { product_name: '기업용 네트워크 스위치 및 라우터 납품', buyer_name: '홍길동 대표' },
  'INV-20260901-004': { product_name: '물류 센터 전산 바코드 스캐너 50세트', buyer_name: '김철수 대표' },
  'INV-20260905-005': { product_name: '해외 지사 수출용 서버 랙 캐비닛', buyer_name: '김철수 대표' },
  'INV-20260815-006': { product_name: '산업용 고성능 무정전 전원장치(UPS)', buyer_name: '홍길동 대표' },
  'INV-20261012-009': { product_name: '공장 자동화 IoT 센서 모듈 납품', buyer_name: '김철수 대표' },
  'INV-20261021-010': { product_name: '스마트 물류창고 AGV 제어 시스템', buyer_name: '홍길동 대표' },
};

// 초기 기준 데이터셋
const INITIAL_SALES = [
  ...NAVER_DEMO_ORDERS.map((ord, idx) => ({
    id: `s-naver-${idx + 1}`,
    order_key: ord.orderKey,
    product_name: ord.productName,
    buyer_name: ord.customer,
    sales_date: ord.date,
    due_date: '2026-11-14',
    gross_amount: ord.grossAmount,
    status: 'PAID',
    business_partners: { company_name: '네이버 스마트스토어', channel_type: 'SMARTSTORE', ceo_name: '네이버(주)' }
  })),
  ...COUPANG_DEMO_ORDERS.map((ord, idx) => ({
    id: `s-cp-${idx + 1}`,
    order_key: ord.orderKey,
    product_name: ord.productName,
    buyer_name: ord.customer,
    sales_date: ord.date,
    due_date: '2026-11-09',
    gross_amount: ord.grossAmount,
    status: 'PAID',
    business_partners: { company_name: '쿠팡 로켓배송', channel_type: 'COUPANG', ceo_name: '쿠팡(주)' }
  })),
  {
    id: 's-3',
    order_key: 'INV-20261005-003',
    sales_date: '2026-10-05',
    due_date: '2026-11-04',
    gross_amount: 15000000,
    status: 'UNPAID',
    business_partners: { company_name: '(주)알파테크', channel_type: 'B2B', ceo_name: '홍길동' }
  },
  {
    id: 's-4',
    order_key: 'INV-20260901-004',
    sales_date: '2026-09-01',
    due_date: '2026-10-01',
    gross_amount: 5000000,
    status: 'OVERDUE',
    business_partners: { company_name: '(주)베타로지스', channel_type: 'B2B', ceo_name: '김철수' }
  },
  {
    id: 's-5',
    order_key: 'INV-20260905-005',
    sales_date: '2026-09-05',
    due_date: '2026-10-05',
    gross_amount: 5000000,
    status: 'OVERDUE',
    business_partners: { company_name: '(주)감마글로벌', channel_type: 'B2B', ceo_name: '김철수' }
  },
  {
    id: 's-6',
    order_key: 'INV-20260815-006',
    sales_date: '2026-08-15',
    due_date: '2026-09-14',
    gross_amount: 18500000,
    status: 'OVERDUE',
    business_partners: { company_name: '(주)알파테크', channel_type: 'B2B', ceo_name: '홍길동' }
  },
  {
    id: 's-7',
    order_key: 'ORD-20261018-007',
    product_name: '스마트 오피스 데스크 무선 충전 패드',
    buyer_name: '장*희',
    sales_date: '2026-10-18',
    due_date: '2026-11-17',
    gross_amount: 32000000,
    status: 'UNPAID',
    business_partners: { company_name: '네이버 스마트스토어', channel_type: 'SMARTSTORE', ceo_name: '네이버(주)' }
  },
  {
    id: 's-8',
    order_key: 'ORD-20261020-008',
    product_name: '게이밍 스트리머 링라이트 삼각대 풀세트',
    buyer_name: '서*진',
    sales_date: '2026-10-20',
    due_date: '2026-11-19',
    gross_amount: 41500000,
    status: 'UNPAID',
    business_partners: { company_name: '쿠팡 로켓배송', channel_type: 'COUPANG', ceo_name: '쿠팡(주)' }
  },
  {
    id: 's-9',
    order_key: 'INV-20261012-009',
    sales_date: '2026-10-12',
    due_date: '2026-11-11',
    gross_amount: 8500000,
    status: 'UNPAID',
    business_partners: { company_name: '(주)베타로지스', channel_type: 'B2B', ceo_name: '김철수' }
  },
  {
    id: 's-10',
    order_key: 'INV-20261021-010',
    sales_date: '2026-10-21',
    due_date: '2026-11-20',
    gross_amount: 12000000,
    status: 'UNPAID',
    business_partners: { company_name: '(주)알파테크', channel_type: 'B2B', ceo_name: '홍길동' }
  }
];

const INITIAL_SUSPENSE = [
  {
    id: 'sp-1',
    sender_name: '김철수',
    amount: 5000000,
    reason: 'DUPLICATE_CANDIDATES',
    status: 'PENDING',
    conflict_count: 2
  },
  {
    id: 'sp-2',
    sender_name: '(주)모름파트너스',
    amount: 3200000,
    reason: 'UNKNOWN_SENDER',
    status: 'PENDING',
    conflict_count: 0
  }
];

const INITIAL_RISKS = [
  { id: 'r-1', order_key: 'ORD-20261015-0101', risk_category: 'FEE', amount: 340000, description: '네이버 결제 및 연동 수수료' },
  { id: 'r-2', order_key: 'ORD-20261015-0102', risk_category: 'RETURN', amount: 250000, description: '고객 단순 변심 반품 환불 (기계식 키보드)' },
  { id: 'r-3', order_key: 'ORD-20261016-0104', risk_category: 'RETURN', amount: 400000, description: '고객 주문 취소 환불 (게이밍 모니터)' },
  { id: 'r-4', order_key: 'ORD-20261016-0104', risk_category: 'DAMAGE', amount: 250000, description: '배송 중 박스 모서리 파손 보상 (게이밍 모니터)' },
  { id: 'r-5', order_key: 'CP-20261010-0201', risk_category: 'FEE', amount: 770000, description: '쿠팡 로켓배송 판매 수수료 및 보관료' },
  { id: 'r-6', order_key: 'CP-20261010-0202', risk_category: 'RETURN', amount: 340000, description: '쿠팡 로켓배송 반품 입고 차감 (삼각대 패키지)' },
  { id: 'r-7', order_key: 'INV-20261005-003', risk_category: 'FEE', amount: 350000, description: 'B2B 전자세금계산서 발행 및 결제대금 예치 수수료' },
  { id: 'r-8', order_key: 'INV-20260901-004', risk_category: 'RETURN', amount: 500000, description: '납품 규격 불일치 반품 차감' },
  { id: 'r-9', order_key: 'INV-20260815-006', risk_category: 'DAMAGE', amount: 450000, description: '도매 물류 운송 중 포장 파손 보상 청구' },
  { id: 'r-10', order_key: 'INV-20260905-005', risk_category: 'ETC', amount: 200000, description: '납품 일정 지연에 따른 지체상금 공제' }
];

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reconciliation' | 'suspense' | 'partners'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 4번 대사 워크스페이스 상태
  const [reconcileMode, setReconcileMode] = useState<'b2c' | 'b2b'>('b2c');
  const [b2cSource, setB2cSource] = useState<'upload' | 'preset'>('upload');
  const [b2cBatch, setB2cBatch] = useState<'naver' | 'coupang_match' | 'coupang_mismatch'>('naver');
  const [b2cStep, setB2cStep] = useState<number>(1);
  const [b2cReconciled, setB2cReconciled] = useState<boolean>(false);
  const [b2bReconciledIds, setB2bReconciledIds] = useState<string[]>([]);
  const [checkedOrderKeys, setCheckedOrderKeys] = useState<Record<string, boolean>>({});
  const [disputeSuccessOrder, setDisputeSuccessOrder] = useState<string | null>(null);
  const [partialApproved, setPartialApproved] = useState<boolean>(false);

  // 4.1 실제 엑셀/CSV 드래그 앤 드롭 업로드 및 파싱 상태
  const [uploadedBankFile, setUploadedBankFile] = useState<{
    name: string;
    size: number;
    rows: Array<{ date: string; sender: string; amount: number; account: string }>;
    totalAmount: number;
  } | null>(null);

  const [uploadedSettlementFile, setUploadedSettlementFile] = useState<{
    name: string;
    size: number;
    rows: Array<{
      orderKey: string;
      platform: string;
      date: string;
      productName?: string;
      customer?: string;
      grossAmount: number;
      settledAmount: number;
      fee: number;
      returnLoss: number;
      damage: number;
      etc: number;
    }>;
    totalGross: number;
    totalSettled: number;
    totalFee: number;
    totalReturn: number;
    totalDamage: number;
    totalEtc: number;
  } | null>(null);

  const [uploadedStep, setUploadedStep] = useState<number>(1);
  const [uploadedReconciled, setUploadedReconciled] = useState<boolean>(false);
  const [isBankDragging, setIsBankDragging] = useState<boolean>(false);
  const [isSettlementDragging, setIsSettlementDragging] = useState<boolean>(false);
  const [filePreviewType, setFilePreviewType] = useState<'bank' | 'settlement' | null>(null);

  const [presetOrderFilter, setPresetOrderFilter] = useState<'ALL' | 'DEDUCTED' | 'NORMAL'>('ALL');
  const [presetOrderSearch, setPresetOrderSearch] = useState<string>('');

  const bankFileInputRef = useRef<HTMLInputElement>(null);
  const settlementFileInputRef = useRef<HTMLInputElement>(null);

  // 5번 예외 처리 및 거래처 마스터 / 감사 로그 상태
  const [suspenseFilter, setSuspenseFilter] = useState<'ALL' | 'DUPLICATE_CANDIDATES' | 'UNMATCHED_AMOUNT' | 'UNKNOWN_SENDER'>('ALL');
  const [partnerChannelFilter, setPartnerChannelFilter] = useState<string>('ALL');
  const [adminMemo, setAdminMemo] = useState<string>('유선 입금자 확인 및 계좌 대조 완료 (정상 승인)');
  const [showNewPartnerModal, setShowNewPartnerModal] = useState<boolean>(false);
  const [newPartnerForm, setNewPartnerForm] = useState({ company_name: '', ceo_name: '', business_number: '', channel_type: 'B2B' });

  const [partnersList, setPartnersList] = useState<any[]>([
    { id: 'p-1', company_name: '(주)알파테크', business_number: '120-81-12345', ceo_name: '홍길동', channel_type: 'B2B', uncollected: 15000000, last_deal: '2026-10-05', alias_active: true },
    { id: 'p-2', company_name: '(주)베타로지스', business_number: '214-82-67890', ceo_name: '김철수', channel_type: 'B2B', uncollected: 5000000, last_deal: '2026-09-01', alias_active: true },
    { id: 'p-3', company_name: '(주)감마글로벌', business_number: '305-86-54321', ceo_name: '김철수', channel_type: 'B2B', uncollected: 5000000, last_deal: '2026-09-05', alias_active: true },
    { id: 'p-4', company_name: '네이버 스마트스토어', business_number: '000-00-00001', ceo_name: '네이버(주)', channel_type: 'SMARTSTORE', uncollected: 0, last_deal: '2026-10-15', alias_active: false },
    { id: 'p-5', company_name: '쿠팡 로켓배송', business_number: '000-00-00002', ceo_name: '쿠팡(주)', channel_type: 'COUPANG', uncollected: 0, last_deal: '2026-10-10', alias_active: false },
  ]);

  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'a-1', action_type: 'AUTO_2STEP_RECONCILE', target_id: 'ORD-20261015-001', actor_email: 'system@auto.reconcile', actor_role: 'admin', memo: '네이버 정산 2-Step 대사 및 4대 리스크 분해 완료', amount: 42300000, created_at: '2026-10-22 13:30' },
    { id: 'a-2', action_type: 'CEO_ALIAS_MATCH', target_id: 'INV-20261005-003', actor_email: 'admin@finance.corp', actor_role: 'admin', memo: '대표자 개인명(홍길동) 교차 대조 확인 후 원클릭 승인', amount: 15000000, created_at: '2026-10-22 15:10' }
  ]);

  // 실데이터 상태
  const [salesRecords, setSalesRecords] = useState<any[]>(INITIAL_SALES);
  const [suspenseList, setSuspenseList] = useState<any[]>(INITIAL_SUSPENSE);
  const [riskList, setRiskList] = useState<any[]>(INITIAL_RISKS);

  // 모달 상태
  const [drillDownItem, setDrillDownItem] = useState<{ category: string; records: any[] } | null>(null);
  const [conflictModalItem, setConflictModalItem] = useState<any | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  // Supabase 실데이터 동기화
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: sales } = await supabase.from('sales_records').select(`
        *,
        business_partners (company_name, channel_type, ceo_name)
      `);
      if (sales && sales.length > 0) {
        const enrichedSales = sales.map(s => ({
          ...s,
          product_name: s.product_name || ORDER_METADATA_MAP[s.order_key]?.product_name || '전자상거래 표준 품목',
          buyer_name: s.buyer_name || ORDER_METADATA_MAP[s.order_key]?.buyer_name || (s.business_partners?.ceo_name || '-')
        }));
        setSalesRecords(enrichedSales);
      }

      const { data: risks } = await supabase.from('risk_records').select('*');
      if (risks && risks.length > 0) setRiskList(risks);

      if (currentRole === 'viewer') {
        setSuspenseList([]);
      } else {
        const { data: suspense } = await supabase.from('suspense_amounts').select('*');
        if (suspense && suspense.length > 0) setSuspenseList(suspense);
      }
    } catch (err) {
      console.warn('Supabase fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole === 'viewer') {
      setSuspenseList([]);
    } else {
      fetchData();
    }
  }, [currentRole]);

  // 검색 및 채널 필터 적용
  const filteredSales = salesRecords.filter(s => {
    const matchChannel = channelFilter === 'ALL' || s.business_partners?.channel_type === channelFilter;
    const matchQuery = !searchQuery || 
      s.order_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.business_partners?.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.business_partners?.ceo_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchChannel && matchQuery;
  });

  // 거래처별 그룹 아코디언 확장 상태 (기본: 모두 접힘 상태)
  const [expandedPartners, setExpandedPartners] = useState<Record<string, boolean>>({});

  // 거래처 테이블 정렬 상태 (기본: 총청구금액 높은 순 내림차순)
  const [partnerSortField, setPartnerSortField] = useState<'totalGross' | 'unpaidGross' | 'totalCount' | 'companyName'>('totalGross');
  const [partnerSortOrder, setPartnerSortOrder] = useState<'asc' | 'desc'>('desc');

  const handlePartnerSort = (field: 'totalGross' | 'unpaidGross' | 'totalCount' | 'companyName') => {
    if (partnerSortField === field) {
      setPartnerSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setPartnerSortField(field);
      setPartnerSortOrder('desc');
    }
  };

  const togglePartnerExpand = (partnerKey: string) => {
    setExpandedPartners(prev => ({
      ...prev,
      [partnerKey]: !prev[partnerKey]
    }));
  };

  // 거래처별 주문 그룹핑 집계
  const groupedSales = React.useMemo(() => {
    const map = new Map<string, {
      partnerKey: string;
      companyName: string;
      channelType: string;
      ceoName: string;
      totalGross: number;
      paidGross: number;
      unpaidGross: number;
      overdueGross: number;
      totalCount: number;
      paidCount: number;
      unpaidCount: number;
      overdueCount: number;
      earliestDate: string;
      latestDate: string;
      orders: any[];
    }>();

    filteredSales.forEach(s => {
      const companyName = s.business_partners?.company_name || '기타 거래처';
      const channelType = s.business_partners?.channel_type || 'B2B';
      const ceoName = s.business_partners?.ceo_name || '-';
      const key = `${companyName}_${channelType}`;

      if (!map.has(key)) {
        map.set(key, {
          partnerKey: key,
          companyName,
          channelType,
          ceoName,
          totalGross: 0,
          paidGross: 0,
          unpaidGross: 0,
          overdueGross: 0,
          totalCount: 0,
          paidCount: 0,
          unpaidCount: 0,
          overdueCount: 0,
          earliestDate: s.sales_date,
          latestDate: s.sales_date,
          orders: []
        });
      }

      const g = map.get(key)!;
      const amt = Number(s.gross_amount || 0);
      g.totalGross += amt;
      g.totalCount += 1;
      g.orders.push(s);

      if (s.sales_date < g.earliestDate) g.earliestDate = s.sales_date;
      if (s.sales_date > g.latestDate) g.latestDate = s.sales_date;

      if (s.status === 'PAID') {
        g.paidGross += amt;
        g.paidCount += 1;
      } else if (s.status === 'OVERDUE') {
        g.overdueGross += amt;
        g.overdueCount += 1;
      } else {
        g.unpaidGross += amt;
        g.unpaidCount += 1;
      }
    });

    const result = Array.from(map.values());
    result.forEach(g => {
      g.orders.sort((a, b) => (b.sales_date || '').localeCompare(a.sales_date || ''));
    });

    return result.sort((a, b) => {
      let cmp = 0;
      if (partnerSortField === 'totalGross') {
        cmp = b.totalGross - a.totalGross;
      } else if (partnerSortField === 'unpaidGross') {
        const uncollectedA = a.unpaidGross + a.overdueGross;
        const uncollectedB = b.unpaidGross + b.overdueGross;
        cmp = uncollectedB - uncollectedA;
      } else if (partnerSortField === 'totalCount') {
        cmp = b.totalCount - a.totalCount;
      } else if (partnerSortField === 'companyName') {
        cmp = a.companyName.localeCompare(b.companyName);
      }
      return partnerSortOrder === 'desc' ? cmp : -cmp;
    });
  }, [filteredSales, partnerSortField, partnerSortOrder]);

  const toggleAllPartners = () => {
    const allExpanded = groupedSales.every(g => expandedPartners[g.partnerKey]);
    const next: Record<string, boolean> = {};
    groupedSales.forEach(g => {
      next[g.partnerKey] = !allExpanded;
    });
    setExpandedPartners(next);
  };

  // KPI 지표 집계
  const totalRevenue = filteredSales.reduce((acc, cur) => acc + Number(cur.gross_amount || 0), 0);
  const totalCollected = filteredSales
    .filter(s => s.status === 'PAID')
    .reduce((acc, cur) => acc + Number(cur.gross_amount || 0), 0);
  const totalAR = filteredSales
    .filter(s => s.status === 'UNPAID' || s.status === 'OVERDUE')
    .reduce((acc, cur) => acc + Number(cur.gross_amount || 0), 0);
  const overdueAR = filteredSales
    .filter(s => s.status === 'OVERDUE')
    .reduce((acc, cur) => acc + Number(cur.gross_amount || 0), 0);
  const totalSuspense = suspenseList.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
  const reconciliationRate = totalRevenue > 0 ? ((totalCollected / totalRevenue) * 100).toFixed(1) : '0';

  // 리스크 발생 채널 판별 헬퍼
  const getRiskChannel = (orderKey: string) => {
    const sales = salesRecords.find(s => s.order_key === orderKey);
    if (sales?.business_partners?.channel_type) {
      return sales.business_partners.channel_type;
    }
    if (orderKey.startsWith('INV-')) return 'B2B';
    if (orderKey.includes('COUPANG') || orderKey.startsWith('ORD-20261010') || orderKey.startsWith('ORD-20261020') || orderKey.startsWith('CP-')) return 'COUPANG';
    return 'SMARTSTORE';
  };

  // 선택된 상단 채널 필터(channelFilter)에 부합하는 리스크 목록 추출
  const filteredRiskList = riskList.filter(r => {
    if (channelFilter === 'ALL') return true;
    return getRiskChannel(r.order_key) === channelFilter;
  });

  // 리스크 파이차트 색상 (정산수수료 / 반품/취소 / 파손/사고 / 기타) - 현 채널 필터 적용
  const riskCategories = [
    { name: '정산수수료', key: 'FEE', value: 0, color: '#1E40AF' },
    { name: '반품/취소', key: 'RETURN', value: 0, color: '#DC2626' },
    { name: '파손/사고', key: 'DAMAGE', value: 0, color: '#38BDF8' },
    { name: '기타', key: 'ETC', value: 0, color: '#94A3B8' }
  ];

  filteredRiskList.forEach(r => {
    const target = riskCategories.find(c => c.key === r.risk_category);
    if (target) target.value += Number(r.amount || 0);
  });

  const totalRiskValue = riskCategories.reduce((sum, c) => sum + c.value, 0);
  const sortedRisks = [...riskCategories].sort((a, b) => b.value - a.value);
  const maxRisk = sortedRisks[0];
  const maxRiskPct = totalRiskValue > 0 ? ((maxRisk.value / totalRiskValue) * 100).toFixed(1) : '0';

  // 채널별 주차별 리스크 시계열 추이 (만원 단위) & 인사이트 요약
  const channelTrendMap: Record<string, {
    data: Array<{ week: string; fee: number; returnLoss: number; damage: number; etc: number }>;
    insightTitle: string;
    insightValue: string;
    insightColor: string;
  }> = {
    ALL: {
      data: [
        { week: '10월 1주차', fee: 120, returnLoss: 40, damage: 15, etc: 5 },
        { week: '10월 2주차', fee: 180, returnLoss: 65, damage: 25, etc: 8 },
        { week: '10월 3주차', fee: 240, returnLoss: 90, damage: 30, etc: 10 },
        { week: '10월 4주차 (현재)', fee: 310, returnLoss: 124, damage: 35, etc: 12 },
      ],
      insightTitle: '10월 4주차 전체 반품 손실 증가 추세 감지',
      insightValue: '+37.8% 주간 상승',
      insightColor: 'text-rose-600'
    },
    COUPANG: {
      data: [
        { week: '10월 1주차', fee: 75, returnLoss: 28, damage: 10, etc: 3 },
        { week: '10월 2주차', fee: 110, returnLoss: 45, damage: 18, etc: 5 },
        { week: '10월 3주차', fee: 150, returnLoss: 62, damage: 22, etc: 7 },
        { week: '10월 4주차 (현재)', fee: 195, returnLoss: 86, damage: 26, etc: 8 },
      ],
      insightTitle: '쿠팡 로켓 반품·고객 클레임 손실 집중 모니터링',
      insightValue: '+38.7% 주간 증가',
      insightColor: 'text-rose-600'
    },
    SMARTSTORE: {
      data: [
        { week: '10월 1주차', fee: 35, returnLoss: 12, damage: 5, etc: 2 },
        { week: '10월 2주차', fee: 52, returnLoss: 20, damage: 7, etc: 3 },
        { week: '10월 3주차', fee: 68, returnLoss: 28, damage: 8, etc: 3 },
        { week: '10월 4주차 (현재)', fee: 88, returnLoss: 38, damage: 9, etc: 4 },
      ],
      insightTitle: '스마트스토어 낮은 수수료율 및 안정적 반품률 유지',
      insightValue: '+11.4% 완만한 추세',
      insightColor: 'text-emerald-600'
    },
    B2B: {
      data: [
        { week: '10월 1주차', fee: 10, returnLoss: 0, damage: 0, etc: 0 },
        { week: '10월 2주차', fee: 18, returnLoss: 0, damage: 0, etc: 0 },
        { week: '10월 3주차', fee: 22, returnLoss: 0, damage: 0, etc: 0 },
        { week: '10월 4주차 (현재)', fee: 27, returnLoss: 0, damage: 0, etc: 0 },
      ],
      insightTitle: 'B2B 도매 채널 플랫폼 수수료 및 반품 리스크 0원',
      insightValue: '0% 무리스크 (외상관리 집중)',
      insightColor: 'text-[#1E40AF]'
    }
  };

  const currentTrend = channelTrendMap[channelFilter] || channelTrendMap['ALL'];
  const riskTrendData = currentTrend.data;

  // 컴팩트한 한 줄 범례 렌더러 (글씨 크기 축소 및 줄바꿈 방지)
  const renderCompactLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex items-center justify-center gap-3.5 pt-2 text-[11px] font-medium text-slate-600 whitespace-nowrap overflow-x-auto select-none">
        {payload.map((entry: any, index: number) => (
          <span key={`legend-item-${index}`} className="inline-flex items-center gap-1.5 shrink-0">
            <span 
              className="w-2 h-2 rounded-full inline-block shrink-0" 
              style={{ backgroundColor: entry.color }} 
            />
            <span className="hover:text-slate-900 transition-colors">{entry.value}</span>
          </span>
        ))}
      </div>
    );
  };

  // 컴팩트 파이 차트 툴팁 (작고 깔끔한 디자인)
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl px-3 py-2 shadow-lg shadow-slate-900/5 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: data.payload.color || data.color }} 
            />
            <span className="text-[11px] font-medium text-slate-600">{data.name}</span>
            <span className="text-slate-300">:</span>
            <span className="text-xs font-bold font-mono text-[#0F172A]">
              ₩ {Number(data.value).toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // 컴팩트 라인 차트 툴팁 (작고 정돈된 리포트형 디자인)
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-lg shadow-slate-900/5 min-w-[150px] animate-fadeIn">
          <div className="text-[11px] font-bold text-slate-800 pb-1.5 mb-1.5 border-b border-slate-100 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] font-normal text-slate-400">주간 손실</span>
          </div>
          <div className="space-y-1">
            {payload.map((item: any, idx: number) => (
              <div key={`line-tip-${idx}`} className="flex items-center justify-between gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold font-mono text-[#0F172A]">
                  {item.value} 만원
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // 드릴다운 클릭 (현재 선택된 채널 건만 전달)
  const handlePieClick = (data: any) => {
    const matchedCategory = data.key || 'FEE';
    const relatedRisks = filteredRiskList.filter(r => r.risk_category === matchedCategory);
    setDrillDownItem({
      category: data.name,
      records: relatedRisks
    });
  };

  // 5.2 동명/동일 금액 중복 충돌 수동 분개 확정 (Admin)
  const handleResolveConflict = () => {
    if (!conflictModalItem || !selectedCandidate) return;

    const candidateName = selectedCandidate === 'beta' ? '(주)베타로지스' : '(주)감마글로벌';
    const candidateInvoice = selectedCandidate === 'beta' ? 'INV-20260901-004' : 'INV-20260905-005';

    // 1. 해당 매출 원장 PAID 상태로 전이
    setSalesRecords(prev => prev.map(s => s.order_key === candidateInvoice ? { ...s, status: 'PAID' } : s));

    // 2. 가수금 목록에서 해당 건 제거
    setSuspenseList(prev => prev.filter(s => s.id !== conflictModalItem.id));

    // 3. 감사 로그(Audit Trail)에 정식 기록
    const newAudit = {
      id: `a-${Date.now()}`,
      action_type: 'MANUAL_CONFLICT_RESOLVED',
      target_id: candidateInvoice,
      actor_email: currentRole === 'admin' ? 'admin@finance.corp' : 'user@finance.corp',
      actor_role: currentRole,
      memo: `[동명 충돌 수동 분개] ${candidateName} 선택 확정. 사유: ${adminMemo}`,
      amount: Number(conflictModalItem.amount || 0),
      created_at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    setActionSuccessMsg(`[수동 분개 완료] ${candidateName}(${candidateInvoice})으로 ₩ ${Number(conflictModalItem.amount).toLocaleString()}원이 성공적으로 상계 분개되었습니다. (감사 로그 자동 기록)`);
    setConflictModalItem(null);
    setSelectedCandidate('');

    setTimeout(() => {
      setActionSuccessMsg('');
    }, 4500);
  };

  // 5.1 신규 다채널 거래처/플랫폼 및 대표자명 맵핑 등록
  const handleAddNewPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerForm.company_name || !newPartnerForm.ceo_name) return;

    const newPartner = {
      id: `p-${Date.now()}`,
      company_name: newPartnerForm.company_name,
      ceo_name: newPartnerForm.ceo_name,
      business_number: newPartnerForm.business_number || '123-45-67890',
      channel_type: newPartnerForm.channel_type || 'B2B',
      uncollected: 0,
      last_deal: '2026-10-22',
      alias_active: true
    };

    setPartnersList(prev => [newPartner, ...prev]);
    setShowNewPartnerModal(false);
    setNewPartnerForm({ company_name: '', ceo_name: '', business_number: '', channel_type: 'B2B' });

    const newAudit = {
      id: `a-${Date.now()}`,
      action_type: 'PARTNER_ALIAS_REGISTERED',
      target_id: newPartner.company_name,
      actor_email: currentRole === 'admin' ? 'admin@finance.corp' : 'user@finance.corp',
      actor_role: currentRole,
      memo: `신규 거래처/채널 [${newPartner.channel_type}] ${newPartner.company_name} (대표: ${newPartner.ceo_name}) 맵핑 마스터 등록 완료`,
      amount: 0,
      created_at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    setActionSuccessMsg(`[거래처 마스터 등록] [${newPartner.channel_type}] ${newPartner.company_name} (대표자: ${newPartner.ceo_name})가 등록되어 적요 교차 매칭에 즉시 반영됩니다.`);
    setTimeout(() => setActionSuccessMsg(''), 4500);
  };

  // 차액 불일치 건 승인/처리
  const handleResolveDiffItem = (item: any) => {
    setSuspenseList(prev => prev.filter(s => s.id !== item.id));
    const newAudit = {
      id: `a-${Date.now()}`,
      action_type: 'DIFF_AMOUNT_RESOLVED',
      target_id: item.sender_name,
      actor_email: 'admin@finance.corp',
      actor_role: currentRole,
      memo: '차액 원인 분석 후 잡손실(정산 차손) 회계 분개 완료',
      amount: Number(item.amount || 0),
      created_at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [newAudit, ...prev]);
    setActionSuccessMsg(`[차액 정산 승인] ${item.sender_name} 건 ₩ ${Number(item.amount).toLocaleString()}원이 승인 분개 처리되었습니다.`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // =========================================================================
  // 4.1 실제 엑셀/CSV 파서 및 드래그 앤 드롭 핸들러
  // =========================================================================

  // 은행 파일 파싱
  const parseBankFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const rawRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const parsedRows = rawRows.map(r => {
          const getVal = (patterns: string[]) => {
            for (const key of Object.keys(r)) {
              const lower = key.trim().toLowerCase();
              if (patterns.some(p => lower.includes(p))) return r[key];
            }
            return undefined;
          };
          const rawAmt = getVal(['입금액', '입금', 'amount', 'deposit', '거래금액', '금액']) ?? 0;
          const numAmt = typeof rawAmt === 'number' ? rawAmt : Number(String(rawAmt).replace(/[^0-9.-]+/g, '')) || 0;

          return {
            date: String(getVal(['거래일시', '거래일', '일자', 'date', '날짜']) || new Date().toISOString().slice(0, 10)),
            sender: String(getVal(['적요', '입금자명', '입금자', 'sender', '거래처', '내용', 'description']) || '미지정 입금처'),
            amount: numAmt,
            account: String(getVal(['계좌번호', '계좌', 'account', 'bank']) || '기본계좌')
          };
        }).filter(r => r.amount > 0);

        const totalAmount = parsedRows.reduce((acc, cur) => acc + cur.amount, 0);

        setUploadedBankFile({
          name: file.name,
          size: file.size,
          rows: parsedRows,
          totalAmount
        });
        setUploadedStep(1);
        setUploadedReconciled(false);
        setActionSuccessMsg(`[은행 파일 로드] ${file.name} (${parsedRows.length}건, ₩ ${totalAmount.toLocaleString()}) 파싱 완료`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } catch (err) {
        console.error('Bank file parse error:', err);
        alert('은행 엑셀/CSV 파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 플랫폼 정산 파일 파싱
  const parseSettlementFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const rawRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let sumGross = 0;
        let sumSettled = 0;
        let sumFee = 0;
        let sumReturn = 0;
        let sumDamage = 0;
        let sumEtc = 0;

        const parsedRows = rawRows.map((r, idx) => {
          const getVal = (patterns: string[]) => {
            for (const key of Object.keys(r)) {
              const lower = key.trim().toLowerCase();
              if (patterns.some(p => lower.includes(p))) return r[key];
            }
            return undefined;
          };

          const parseNum = (val: any) => {
            if (typeof val === 'number') return val;
            if (!val) return 0;
            return Number(String(val).replace(/[^0-9.-]+/g, '')) || 0;
          };

          const orderKey = String(getVal(['주문번호', 'order_key', 'order_id', '주문', '번호', '승인번호']) || `ORD-UP-${1000 + idx}`);
          const platform = String(getVal(['플랫폼명', '플랫폼', '채널', 'platform', 'channel']) || '오픈마켓');
          const date = String(getVal(['주문일자', '일자', 'date', '매출일', '날짜']) || new Date().toISOString().slice(0, 10));
          const productName = String(getVal(['상품명', '품목', '상품', 'product', 'item']) || '기본 상품');
          const customer = String(getVal(['고객명', '구매자', '고객', 'customer', 'buyer']) || '-');

          const gross = parseNum(getVal(['결제금액', '판매금액', '매출금액', '총금액', 'gross', 'amount']));
          const fee = parseNum(getVal(['정산수수료', '수수료', 'fee', '결제수수료']));
          const returnLoss = parseNum(getVal(['반품환불액', '반품액', '환불액', '반품', '환불', 'return', 'refund']));
          const damage = parseNum(getVal(['파손손실액', '파손액', '손실액', '파손', 'damage']));
          const etc = parseNum(getVal(['기타공제', '기타', 'etc', '차감']));

          let settled = parseNum(getVal(['정산지급액', '실지급액', '정산액', '지급액', 'settled']));
          if (settled === 0 && gross > 0) {
            settled = gross - (fee + returnLoss + damage + etc);
          }

          sumGross += (gross || (settled + fee + returnLoss + damage + etc));
          sumSettled += settled;
          sumFee += fee;
          sumReturn += returnLoss;
          sumDamage += damage;
          sumEtc += etc;

          return {
            orderKey,
            platform,
            date,
            productName,
            customer,
            grossAmount: gross || (settled + fee + returnLoss + damage + etc),
            settledAmount: settled,
            fee,
            returnLoss,
            damage,
            etc
          };
        });

        setUploadedSettlementFile({
          name: file.name,
          size: file.size,
          rows: parsedRows,
          totalGross: sumGross,
          totalSettled: sumSettled,
          totalFee: sumFee,
          totalReturn: sumReturn,
          totalDamage: sumDamage,
          totalEtc: sumEtc
        });
        setUploadedStep(1);
        setUploadedReconciled(false);
        setActionSuccessMsg(`[정산 파일 로드] ${file.name} (${parsedRows.length}개 주문, 정산액 ₩ ${sumSettled.toLocaleString()}) 파싱 완료`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } catch (err) {
        console.error('Settlement file parse error:', err);
        alert('정산 엑셀/CSV 파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 샘플 템플릿 다운로드 핸들러
  const handleDownloadSampleBankFile = () => {
    const sampleBankData = [
      { '거래일시': '2026-10-20 09:30:15', '거래구분': '입금', '입금액(원)': 42300000, '적요/입금자명': '네이버페이_정산', '은행명': '기업은행', '계좌번호': '010-1234-5678' },
      { '거래일시': '2026-10-22 11:05:40', '거래구분': '입금', '입금액(원)': 76260000, '적요/입금자명': '쿠팡_정산지급', '은행명': '하나은행', '계좌번호': '220-456-78901' },
      { '거래일시': '2026-10-21 14:12:00', '거래구분': '입금', '입금액(원)': 15000000, '적요/입금자명': '홍길동', '은행명': '신한은행', '계좌번호': '110-987-65432' },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleBankData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '은행입금원장');
    XLSX.writeFile(wb, 'FinanceFlow_샘플_은행입금내역.xlsx');
  };

  const handleDownloadSampleSettlementFile = (type: 'naver_match' | 'coupang_match' | 'coupang_diff' | 'match' | 'diff' = 'naver_match') => {
    let sampleSettlementData: any[] = [];
    let filename = '';

    if (type === 'naver_match' || type === 'match') {
      sampleSettlementData = NAVER_DEMO_ORDERS.map(o => ({
        '주문번호': o.orderKey,
        '플랫폼명': '네이버 스마트스토어',
        '주문일자': o.date,
        '상품명': o.productName,
        '고객명': o.customer,
        '결제금액': o.grossAmount,
        '정산지급액': o.settledAmount,
        '정산수수료': o.fee,
        '반품환불액': o.returnLoss,
        '파손손실액': o.damage,
        '기타공제': o.etc
      }));
      filename = 'FinanceFlow_샘플_네이버정산서(8건_일치).xlsx';
    } else if (type === 'coupang_match') {
      sampleSettlementData = COUPANG_DEMO_ORDERS.map(o => ({
        '주문번호': o.orderKey,
        '플랫폼명': '쿠팡 로켓배송',
        '주문일자': o.date,
        '상품명': o.productName,
        '고객명': o.customer,
        '결제금액': o.grossAmount,
        '정산지급액': o.settledAmount,
        '정산수수료': o.fee,
        '반품환불액': o.returnLoss,
        '파손손실액': o.damage,
        '기타공제': o.etc
      }));
      filename = 'FinanceFlow_샘플_쿠팡정산서(8건_일치).xlsx';
    } else {
      sampleSettlementData = COUPANG_DEMO_ORDERS.map(o => ({
        '주문번호': o.orderKey,
        '플랫폼명': '쿠팡 로켓배송',
        '주문일자': o.date,
        '상품명': o.productName,
        '고객명': o.customer,
        '결제금액': o.grossAmount,
        '정산지급액': o.settledAmount,
        '정산수수료': o.fee,
        '반품환불액': o.returnLoss,
        '파손손실액': o.damage,
        '기타공제': o.etc
      }));
      filename = 'FinanceFlow_샘플_쿠팡정산서(8건_차액발생).xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(sampleSettlementData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '플랫폼정산서');
    XLSX.writeFile(wb, filename);
  };

  // 업로드 파일 기반 대사 확정 처리
  const handleConfirmUploadedReconciliation = () => {
    if (!uploadedSettlementFile) return;

    const newRisks: any[] = [];
    uploadedSettlementFile.rows.forEach((r, idx) => {
      if (r.fee > 0) {
        newRisks.push({
          id: `r-up-fee-${Date.now()}-${idx}`,
          order_key: r.orderKey,
          risk_category: 'FEE',
          amount: r.fee,
          description: `[${r.platform}] 정산 및 결제 수수료 공제`
        });
      }
      if (r.returnLoss > 0) {
        newRisks.push({
          id: `r-up-ret-${Date.now()}-${idx}`,
          order_key: r.orderKey,
          risk_category: 'RETURN',
          amount: r.returnLoss,
          description: `[${r.platform}] 고객 반품 및 환불 차감`
        });
      }
      if (r.damage > 0) {
        newRisks.push({
          id: `r-up-dmg-${Date.now()}-${idx}`,
          order_key: r.orderKey,
          risk_category: 'DAMAGE',
          amount: r.damage,
          description: `[${r.platform}] 배송 파손 및 보상 차감`
        });
      }
      if (r.etc > 0) {
        newRisks.push({
          id: `r-up-etc-${Date.now()}-${idx}`,
          order_key: r.orderKey,
          risk_category: 'ETC',
          amount: r.etc,
          description: `[${r.platform}] 프로모션 분담 및 기타 공제`
        });
      }
    });

    setRiskList(prev => [...newRisks, ...prev]);

    // 매출 레코드 PAID 상태 갱신
    const orderKeys = uploadedSettlementFile.rows.map(r => r.orderKey);
    setSalesRecords(prev => prev.map(s => {
      if (orderKeys.includes(s.order_key)) {
        return { ...s, status: 'PAID' };
      }
      return s;
    }));

    // 감사 로그 기록
    const newAudit = {
      id: `a-${Date.now()}`,
      action_type: 'EXCEL_2STEP_RECONCILE',
      target_id: uploadedSettlementFile.name,
      actor_email: currentRole === 'admin' ? 'admin@finance.corp' : 'user@finance.corp',
      actor_role: currentRole,
      memo: `업로드 엑셀 대사 확정 (${uploadedSettlementFile.rows.length}개 주문 완료, 리스크 ${newRisks.length}건 장부 반영)`,
      amount: uploadedSettlementFile.totalSettled,
      created_at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    setUploadedReconciled(true);
    setActionSuccessMsg(`[대사 확정 완료] ₩ ${uploadedSettlementFile.totalSettled.toLocaleString()}원 정산 및 ${newRisks.length}건 리스크가 전사 장부에 반영되었습니다.`);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  // 업로드 덩어리 불일치 차액 가수금 이관
  const handleTransferUploadedDiffToSuspense = () => {
    if (!uploadedBankFile || !uploadedSettlementFile) return;
    const diff = Math.abs(uploadedBankFile.totalAmount - uploadedSettlementFile.totalSettled);
    const newSuspense = {
      id: `sp-up-${Date.now()}`,
      sender_name: uploadedBankFile.rows[0]?.sender || '업로드 엑셀 정산처',
      amount: diff,
      reason: 'UNMATCHED_AMOUNT',
      status: 'PENDING',
      conflict_count: 0
    };
    setSuspenseList(prev => [newSuspense, ...prev]);
    const newAudit = {
      id: `a-${Date.now()}`,
      action_type: 'DIFF_MOVED_TO_SUSPENSE',
      target_id: uploadedSettlementFile.name,
      actor_email: 'admin@finance.corp',
      actor_role: currentRole,
      memo: `업로드 엑셀 덩어리 대사 불일치 차액 ₩ ${diff.toLocaleString()}원 미확인 가수금 보관함으로 자동 격리`,
      amount: diff,
      created_at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [newAudit, ...prev]);
    setActionSuccessMsg(`[가수금 이관] 차액 ₩ ${diff.toLocaleString()}원이 미확인 보관함(suspense_amounts)으로 성공적으로 이관되었습니다.`);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-sans antialiased">
      {/* ============================================================== */}
      {/* 1. 좌측 사이드바 (Left Navigation Bar)                          */}
      {/* ============================================================== */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 shadow-sm z-30">
        <div>
          {/* 로고 영역 */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-[#1E40AF] flex items-center justify-center text-white shadow-md shadow-blue-900/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#0F172A] block leading-tight">
                FinanceFlow
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                자금/정산 대사 엔진
              </span>
            </div>
          </div>

          {/* 메인 메뉴 그룹 */}
          <div className="p-4 space-y-6">
            <div>
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Core Management
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-50/80 text-[#1E40AF] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#1E40AF]' : 'text-slate-400'}`} />
                    <span>핵심 대시보드</span>
                  </div>
                  {activeTab === 'dashboard' && <span className="w-1.5 h-4 bg-[#1E40AF] rounded-full" />}
                </button>

                <button
                  onClick={() => setActiveTab('reconciliation')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'reconciliation'
                      ? 'bg-blue-50/80 text-[#1E40AF] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Receipt className={`w-4 h-4 ${activeTab === 'reconciliation' ? 'text-[#1E40AF]' : 'text-slate-400'}`} />
                    <span>2-Step 정산 대조</span>
                  </div>
                  {activeTab === 'reconciliation' && <span className="w-1.5 h-4 bg-[#1E40AF] rounded-full" />}
                </button>

                <button
                  onClick={() => setActiveTab('suspense')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'suspense'
                      ? 'bg-blue-50/80 text-[#1E40AF] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 ${activeTab === 'suspense' ? 'text-[#1E40AF]' : 'text-slate-400'}`} />
                    <span>미확인 가수금 보관함</span>
                  </div>
                  {suspenseList.length > 0 && currentRole !== 'viewer' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {suspenseList.length}건
                    </span>
                  ) : currentRole === 'viewer' ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : null}
                </button>
              </nav>
            </div>

            <div>
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Masters & Settings
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('partners')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'partners'
                      ? 'bg-blue-50/80 text-[#1E40AF] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-4 h-4 ${activeTab === 'partners' ? 'text-[#1E40AF]' : 'text-slate-400'}`} />
                    <span>거래처 & 판매 채널 관리</span>
                  </div>
                  {activeTab === 'partners' && <span className="w-1.5 h-4 bg-[#1E40AF] rounded-full" />}
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* 하단 사용자 프로필 카드 */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-xs flex items-center justify-center font-bold text-xs text-slate-700">
              {currentRole === 'admin' ? '관' : currentRole === 'executive' ? '대표' : '영'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0F172A] truncate">
                {currentRole === 'admin' ? '자금팀 관리자' : currentRole === 'executive' ? '대표이사 (CFO)' : '영업본부 MD'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {currentRole === 'admin' ? 'admin@finance.corp' : currentRole === 'executive' ? 'cfo@finance.corp' : 'sales@finance.corp'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. 메인 컨텐츠 영역 (Header + Dashboard Body)                  */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* 상단 헤더 */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          {/* 검색창 */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="주문번호, 거래처명, 대표자명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 text-xs rounded-xl pl-9 pr-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] transition"
            />
          </div>

          {/* 중앙-우측: 채널 필터 & RBAC 역할 시뮬레이터 */}
          <div className="flex items-center gap-4">
            {/* 채널 필터 */}
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">채널:</span>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">전체 채널</option>
                <option value="SMARTSTORE">스마트스토어</option>
                <option value="COUPANG">쿠팡 로켓</option>
                <option value="B2B">B2B</option>
              </select>
            </div>

            {/* 역할 스위처 (RBAC/RLS 시뮬레이터) */}
            <div className="flex items-center p-1 bg-[#F8FAFC] rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E40AF]" />
                권한:
              </span>
              <button
                onClick={() => setCurrentRole('admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  currentRole === 'admin'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Admin (자금팀)
              </button>
              <button
                onClick={() => setCurrentRole('executive')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  currentRole === 'executive'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Executive (CFO)
              </button>
              <button
                onClick={() => setCurrentRole('viewer')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  currentRole === 'viewer'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Viewer (영업)
              </button>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              title="데이터 동기화"
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1E40AF]' : ''}`} />
            </button>
          </div>
        </header>

        {/* 상단 알림 배너 */}
        {actionSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-8 py-2.5 text-emerald-800 text-xs font-medium flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccessMsg}
          </div>
        )}

        {/* 권한 안내 서브 헤더 */}
        <div className="bg-white border-b border-slate-100 px-8 py-2.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#1E40AF]" />
            {currentRole === 'admin' && (
              <span><strong>자금/재무 관리자 (Admin)</strong>: 전체 매출 데이터 R/W, 입금 대사 매칭 및 <strong>미확인 가수금 수동 분개 권한</strong>을 행사합니다.</span>
            )}
            {currentRole === 'executive' && (
              <span><strong>경영진 (Executive)</strong>: 전사 재무 요약 대시보드 및 리스크/가수금 <strong>전체 읽기(Read-Only)</strong> 권한으로 보고서를 열람합니다.</span>
            )}
            {currentRole === 'viewer' && (
              <span className="text-amber-700 font-medium">
                ⚠️ <strong>영업 관리자 (Viewer)</strong>: 담당 채널의 확정 미수금만 확인 가능하며, <strong>미정산 가수금(suspense_amounts)은 Supabase RLS로 차단됩니다.</strong>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            기준월: 2026-10 (실시간 연동 중)
          </span>
        </div>

        {/* 메인 작업 대시보드 */}
        <main className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' ? (
            <>
              {/* ========================================================== */}
              {/* 3.1. 핵심 KPI 요약 카드 5종 (Sample Style Applied)         */}
              {/* ========================================================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 카드 1: 총 발생 매출액 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">총 발생 매출액</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1E40AF]">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
                    ₩ {totalRevenue.toLocaleString()}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px]">
                      +14.8%
                    </span>
                    <span className="text-slate-400 font-normal">전월 대비 증가</span>
                  </div>
                </div>

                {/* 카드 2: 누적 입금 완료액 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">누적 입금 완료액</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 tracking-tight">
                    ₩ {totalCollected.toLocaleString()}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-800 font-semibold">
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[#1E40AF] text-[11px] font-bold">
                      대사율 {reconciliationRate}%
                    </span>
                    <span className="text-slate-400 font-normal">정상 회수 완료</span>
                  </div>
                </div>

                {/* 카드 3: 미수금 (AR) 총액 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">미수금 (AR) 총액</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
                    ₩ {totalAR.toLocaleString()}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-amber-600">기한 미도래 정상 채권 포함</span>
                  </div>
                </div>

                {/* 카드 4: 악성 연체 채권 (+30일 경과) */}
                <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition bg-gradient-to-br from-white to-rose-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-rose-700">기한 초과 악성 채권</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-rose-600 tracking-tight">
                    ₩ {overdueAR.toLocaleString()}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-rose-700 font-semibold">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mr-1" />
                    +30일 초과 중점 관리 대상
                  </div>
                </div>

                {/* 카드 5: 미확인 가수금 (보관함) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">미확인 가수금 (RLS)</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-[#1E40AF]">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#1E40AF] tracking-tight">
                    {currentRole === 'viewer' ? (
                      <span className="text-sm font-semibold text-slate-400 italic">[RLS 차단]</span>
                    ) : (
                      `₩ ${totalSuspense.toLocaleString()}`
                    )}
                  </div>
                  <div className="mt-3 text-xs text-slate-400">
                    {currentRole === 'viewer' ? '영업 담당자 열람 제한' : '동명 충돌 검토 대기'}
                  </div>
                </div>
              </div>

              {/* ========================================================== */}
              {/* 3.2. 차트 그리드: 리스크 비중(Pie) & 주차별 추이(Line)       */}
              {/* ========================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 차트 1: 차감 리스크 비중 파이 차트 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#1E40AF]">
                          <PieIcon className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm text-[#0F172A]">차감 리스크 비중 분석 (Pie Chart)</h3>
                      </div>
                      <span className="text-xs text-[#1E40AF] font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                        영역 클릭 시 드릴다운
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      총 차감액 중 플랫폼 수수료, 반품 환불액, 배송 파손 손실의 점유율을 추적합니다.
                    </p>
                  </div>

                  <div className="h-64 w-full my-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                          onClick={handlePieClick}
                          className="cursor-pointer focus:outline-none"
                        >
                          {riskCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomPieTooltip />} />
                        <Legend 
                          verticalAlign="bottom" 
                          content={renderCompactLegend} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>최대 손실 원인: <strong>{maxRisk && maxRisk.value > 0 ? `${maxRisk.name} (${maxRiskPct}%)` : '손실 내역 없음 (0%)'}</strong></span>
                    <span className="text-slate-400">
                      {channelFilter === 'ALL' ? '전체 채널 기준' : channelFilter === 'COUPANG' ? '쿠팡 로켓 정산 기준' : channelFilter === 'SMARTSTORE' ? '스마트스토어 정산 기준' : 'B2B 도매 기준'}
                    </span>
                  </div>
                </div>

                {/* 차트 2: 주차별 리스크 발생 추이 라인 차트 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-[#38BDF8]">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm text-[#0F172A]">
                          주차별 리스크 발생 추이 (Line Chart)
                          {channelFilter !== 'ALL' && (
                            <span className="ml-2 text-xs font-semibold text-[#1E40AF] bg-blue-50 px-2 py-0.5 rounded">
                              {channelFilter === 'COUPANG' ? '쿠팡 로켓' : channelFilter === 'SMARTSTORE' ? '스마트스토어' : 'B2B 도매'}
                            </span>
                          )}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">단위: 만원</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {channelFilter === 'ALL' 
                        ? '전체 채널의 프로모션 진행에 따른 반품 급증 및 수수료율 인상 등의 이상 징후를 감지합니다.' 
                        : channelFilter === 'COUPANG'
                        ? '쿠팡 로켓배송의 주차별 수수료 및 반품/클레임 보류 손실 추이를 추적합니다.'
                        : channelFilter === 'SMARTSTORE'
                        ? '네이버 스마트스토어의 주차별 네이버페이 수수료 및 취소/환불 추이를 추적합니다.'
                        : 'B2B 세금계산서 도매 채널의 주차별 손실 추이를 모니터링합니다.'}
                    </p>
                  </div>

                  <div className="h-64 w-full my-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={riskTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip content={<CustomLineTooltip />} />
                        <Legend 
                          verticalAlign="bottom" 
                          content={renderCompactLegend} 
                        />
                        <Line type="monotone" dataKey="fee" name="정산수수료" stroke="#1E40AF" strokeWidth={2} dot={{ r: 3.5, fill: '#1E40AF' }} />
                        <Line type="monotone" dataKey="returnLoss" name="반품/취소" stroke="#DC2626" strokeWidth={2} dot={{ r: 3.5, fill: '#DC2626' }} />
                        <Line type="monotone" dataKey="damage" name="파손/사고" stroke="#38BDF8" strokeWidth={2} dot={{ r: 3.5, fill: '#38BDF8' }} />
                        <Line type="monotone" dataKey="etc" name="기타" stroke="#94A3B8" strokeWidth={2} dot={{ r: 3.5, fill: '#94A3B8' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{currentTrend.insightTitle}</span>
                    <span className={`font-semibold ${currentTrend.insightColor}`}>{currentTrend.insightValue}</span>
                  </div>
                </div>
              </div>

              {/* ========================================================== */}
              {/* 3.3. 미수금 (AR) 거래처별 통합 묶음 & 주문 드릴다운 관리표 */}
              {/* ========================================================== */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#1E40AF]" />
                      미수금 (AR) 현황 및 거래처별 주문 묶음표 (Aging Ledger)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      동일 거래처의 다수 주문건을 하나로 묶어 표기하며, 거래처를 클릭하면 연계된 개별 주문/청구 내역이 펼쳐집니다.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      onClick={toggleAllPartners}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                    >
                      <ChevronsUpDown className="w-3.5 h-3.5 text-[#1E40AF]" />
                      <span>{groupedSales.every(g => expandedPartners[g.partnerKey]) ? '전체 주문 접기' : '전체 주문 펼치기'}</span>
                    </button>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      🟢 정상 (30일 이내)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                      🔴 악성 (+30일 경과)
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs table-fixed">
                    <colgroup>
                      <col className="w-[24%]" />
                      <col className="w-[11%]" />
                      <col className="w-[10%]" />
                      <col className="w-[17%]" />
                      <col className="w-[17%]" />
                      <col className="w-[13%]" />
                      <col className="w-[8%]" />
                    </colgroup>
                    <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th
                          onClick={() => handlePartnerSort('companyName')}
                          className="w-[24%] px-5 py-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap select-none"
                          title="클릭하여 거래처명 정렬"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>거래처명</span>
                            {partnerSortField === 'companyName' ? (
                              <span className="text-[#1E40AF] font-bold">{partnerSortOrder === 'desc' ? '▼' : '▲'}</span>
                            ) : (
                              <span className="text-slate-300">↕</span>
                            )}
                          </div>
                        </th>
                        <th className="w-[11%] px-4 py-3 text-center whitespace-nowrap">채널유형</th>
                        <th
                          onClick={() => handlePartnerSort('totalCount')}
                          className="w-[10%] px-4 py-3 text-center cursor-pointer hover:bg-slate-100 transition whitespace-nowrap select-none"
                          title="클릭하여 총주문수 정렬"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>총주문수</span>
                            {partnerSortField === 'totalCount' ? (
                              <span className="text-[#1E40AF] font-bold">{partnerSortOrder === 'desc' ? '▼' : '▲'}</span>
                            ) : (
                              <span className="text-slate-300">↕</span>
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handlePartnerSort('totalGross')}
                          className="w-[17%] px-5 py-3 text-right cursor-pointer hover:bg-slate-100 transition whitespace-nowrap select-none"
                          title="클릭하여 총청구금액 정렬"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>총청구금액</span>
                            {partnerSortField === 'totalGross' ? (
                              <span className="text-[#1E40AF] font-bold">{partnerSortOrder === 'desc' ? '▼' : '▲'}</span>
                            ) : (
                              <span className="text-slate-300">↕</span>
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => handlePartnerSort('unpaidGross')}
                          className="w-[17%] px-5 py-3 text-right cursor-pointer hover:bg-slate-100 transition whitespace-nowrap select-none"
                          title="클릭하여 미수금액 정렬"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>미수금액</span>
                            {partnerSortField === 'unpaidGross' ? (
                              <span className="text-[#1E40AF] font-bold">{partnerSortOrder === 'desc' ? '▼' : '▲'}</span>
                            ) : (
                              <span className="text-slate-300">↕</span>
                            )}
                          </div>
                        </th>
                        <th className="w-[13%] px-4 py-3 text-center whitespace-nowrap">종합채권상태</th>
                        <th className="w-[8%] px-4 py-3 text-center whitespace-nowrap">상세</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupedSales.map((g) => {
                        const isExpanded = !!expandedPartners[g.partnerKey];
                        const uncollected = g.unpaidGross + g.overdueGross;

                        const getChannelBadge = (ch: string) => {
                          switch (ch) {
                            case 'B2B':
                              return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1E40AF] font-bold text-[10px] border border-blue-200 whitespace-nowrap">B2B</span>;
                            case 'SMARTSTORE':
                              return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 whitespace-nowrap">스마트스토어</span>;
                            case 'COUPANG':
                              return <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold text-[10px] border border-orange-200 whitespace-nowrap">쿠팡 로켓</span>;
                            case 'OWN_MALL':
                              return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200 whitespace-nowrap">자사몰 PG</span>;
                            default:
                              return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] whitespace-nowrap">{ch}</span>;
                          }
                        };

                        return (
                          <React.Fragment key={g.partnerKey}>
                            {/* 거래처 그룹핑 부모 행 (줄바꿈 없는 단일 행 디자인) */}
                            <tr
                              onClick={() => togglePartnerExpand(g.partnerKey)}
                              className={`cursor-pointer transition select-none ${
                                isExpanded ? 'bg-blue-50/50 hover:bg-blue-50/70' : 'hover:bg-slate-50/80'
                              }`}
                            >
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                    <ChevronRight
                                      className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${
                                        isExpanded ? 'rotate-90 text-[#1E40AF]' : ''
                                      }`}
                                    />
                                  </div>
                                  <span className="font-bold text-slate-900 text-xs">
                                    {g.companyName}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-normal">
                                    ({g.ceoName})
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                {getChannelBadge(g.channelType)}
                              </td>
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {g.totalCount}건
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                                ₩ {g.totalGross.toLocaleString()}
                              </td>
                              <td className="px-5 py-3.5 text-right font-mono font-bold text-xs whitespace-nowrap">
                                {uncollected > 0 ? (
                                  <span className={g.overdueCount > 0 ? 'text-rose-600' : 'text-[#1E40AF]'}>
                                    ₩ {uncollected.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-normal">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                {g.overdueCount > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap animate-pulse">
                                    🔴 악성채권 ({g.overdueCount}건)
                                  </span>
                                ) : g.unpaidCount > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1E40AF] border border-blue-200 whitespace-nowrap">
                                    🔵 정상채권 ({g.unpaidCount}건)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                    🟢 정산완료
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap ${
                                  isExpanded
                                    ? 'bg-[#1E40AF] text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}>
                                  {isExpanded ? '접기 ▲' : '상세 ▼'}
                                </span>
                              </td>
                            </tr>

                            {/* 거래처 클릭 시 펼쳐지는 연계 주문/청구 상세 서브 패널 */}
                            {isExpanded && (
                              <tr className="bg-slate-50/90 border-y border-slate-200">
                                <td colSpan={7} className="p-4 sm:p-5">
                                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
                                    {/* 서브 헤더 배너 */}
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1E40AF] flex items-center justify-center shrink-0">
                                          <FolderOpen className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-xs text-[#0F172A] whitespace-nowrap">
                                          [{g.companyName}] 건별 상세 주문 내역 (총 {g.orders.length}건)
                                        </span>
                                        {getChannelBadge(g.channelType)}
                                      </div>
                                      <span className="text-[11px] text-slate-400 whitespace-nowrap hidden sm:inline">
                                        매출 인식일 기준 +30일 경과 시 악성 채권으로 분류
                                      </span>
                                    </div>

                                    {/* 서브 주문 테이블 (열 간격 고정 및 세로줄 구분선 적용) */}
                                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                      <table className="w-full text-xs table-fixed">
                                        <colgroup>
                                          <col className="w-[32%]" />
                                          <col className="w-[16%]" />
                                          <col className="w-[18%]" />
                                          <col className="w-[18%]" />
                                          <col className="w-[16%]" />
                                        </colgroup>
                                        <thead className="bg-[#F8FAFC] text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                                          <tr>
                                            <th className="px-4 py-2.5 text-left border-r border-slate-200 whitespace-nowrap">주문/청구번호 및 상품명</th>
                                            <th className="px-4 py-2.5 text-center border-r border-slate-200 whitespace-nowrap">매출인식일</th>
                                            <th className="px-4 py-2.5 text-center border-r border-slate-200 whitespace-nowrap">정산예정일 (+30D)</th>
                                            <th className="px-4 py-2.5 text-right border-r border-slate-200 whitespace-nowrap">개별 청구 금액</th>
                                            <th className="px-4 py-2.5 text-center whitespace-nowrap">건별 채권 상태</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                          {g.orders.map((ord: any) => (
                                            <tr key={ord.id} className="hover:bg-blue-50/20 transition">
                                              <td className="px-4 py-2.5 font-mono font-bold text-[#1E40AF] text-left border-r border-slate-100 whitespace-nowrap truncate">
                                                <div>{ord.order_key}</div>
                                                {ord.product_name && (
                                                  <div className="text-[11px] font-normal text-slate-500 font-sans truncate">
                                                    {ord.product_name} {ord.buyer_name ? `(${ord.buyer_name})` : ''}
                                                  </div>
                                                )}
                                              </td>
                                              <td className="px-4 py-2.5 text-slate-600 font-medium text-center border-r border-slate-100 whitespace-nowrap">
                                                {ord.sales_date}
                                              </td>
                                              <td className="px-4 py-2.5 text-slate-600 font-medium text-center border-r border-slate-100 whitespace-nowrap">
                                                {ord.due_date}
                                              </td>
                                              <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                                                ₩ {Number(ord.gross_amount || 0).toLocaleString()}
                                              </td>
                                              <td className="px-4 py-2.5 text-center whitespace-nowrap">
                                                {ord.status === 'PAID' && (
                                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                                    🟢 정산 완료
                                                  </span>
                                                )}
                                                {ord.status === 'UNPAID' && (
                                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1E40AF] border border-blue-200 whitespace-nowrap">
                                                    🔵 정상 채권
                                                  </span>
                                                )}
                                                {ord.status === 'OVERDUE' && (
                                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                                                    🔴 기한 초과 악성 채권
                                                  </span>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : activeTab === 'reconciliation' ? (
            /* ============================================================== */
            /* 4. 핵심 데이터 대사 엔진 (Data Matching & Reconciliation)      */
            /* ============================================================== */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-[#1E40AF]" />
                      핵심 데이터 대사 엔진 (Data Matching & Reconciliation)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      B2C(오픈마켓/자사몰) 2-Step 대조 및 B2B(세금계산서) 텍스트+대표자명 지능형 매칭을 실행합니다.
                    </p>
                  </div>

                  {/* B2C vs B2B 서브탭 토글 */}
                  <div className="flex items-center p-1 bg-[#F8FAFC] border border-slate-200 rounded-xl">
                    <button
                      onClick={() => setReconcileMode('b2c')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                        reconcileMode === 'b2c'
                          ? 'bg-[#1E40AF] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      <Split className="w-3.5 h-3.5" />
                      4.1. B2C 2-Step 매칭 (오픈마켓)
                    </button>
                    <button
                      onClick={() => setReconcileMode('b2b')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                        reconcileMode === 'b2b'
                          ? 'bg-[#1E40AF] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      4.2. B2B 텍스트+금액 매칭
                    </button>
                  </div>
                </div>

                {reconcileMode === 'b2c' ? (
                  /* B2C 2-Step 매칭 뷰 */
                  <div className="pt-6 space-y-6">
                    {/* 데이터 소스 선택: 파일 직접 올리기 vs 샘플 데이터로 보기 */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <FileSpreadsheet className="w-4 h-4 text-[#1E40AF]" />
                        <span>진행 방식:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setB2cSource('upload')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            b2cSource === 'upload'
                              ? 'bg-[#1E40AF] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>엑셀 파일 직접 올리기</span>
                        </button>
                        <button
                          onClick={() => setB2cSource('preset')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            b2cSource === 'preset'
                              ? 'bg-[#1E40AF] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>샘플 데이터로 보기</span>
                        </button>
                      </div>
                    </div>

                    {b2cSource === 'upload' ? (
                      /* ======================================================== */
                      /* 4.1-A. 실제 엑셀/CSV 드래그 & 드롭 업로더 및 대사 파서   */
                      /* ======================================================== */
                      <div className="space-y-6 animate-fadeIn">
                        {/* 상단: 테스트용 샘플 엑셀 다운로드 안내 바 */}
                        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#1E40AF]" />
                              테스트용 샘플 엑셀 다운로드
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              직접 준비된 엑셀 파일이 없으시다면 아래 샘플을 다운로드하여 곧바로 올려보세요.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={handleDownloadSampleBankFile}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1E40AF] font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>📥 은행 입금 내역 샘플</span>
                            </button>
                            <button
                              onClick={() => handleDownloadSampleSettlementFile('naver_match')}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-emerald-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>📥 네이버 정산서 (일치 8건)</span>
                            </button>
                            <button
                              onClick={() => handleDownloadSampleSettlementFile('coupang_match')}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-emerald-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>📥 쿠팡 정산서 (일치 8건)</span>
                            </button>
                            <button
                              onClick={() => handleDownloadSampleSettlementFile('coupang_diff')}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-rose-600 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>📥 쿠팡 정산서 (차액 8건)</span>
                            </button>
                          </div>
                        </div>

                        {/* 숨겨진 파일 인풋 */}
                        <input
                          type="file"
                          ref={bankFileInputRef}
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => e.target.files?.[0] && parseBankFile(e.target.files[0])}
                          className="hidden"
                        />
                        <input
                          type="file"
                          ref={settlementFileInputRef}
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => e.target.files?.[0] && parseSettlementFile(e.target.files[0])}
                          className="hidden"
                        />

                        {/* 2구역 드래그 앤 드롭 존 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 구역 1: 은행 통장 입금 원장 */}
                          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                              <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-blue-100 text-[#1E40AF] flex items-center justify-center font-bold text-[11px]">A</span>
                                은행 통장 입금 내역 (통장 원장)
                              </span>
                              <span className="text-[10px] text-slate-400">지원: .xlsx, .xls, .csv</span>
                            </div>

                            {uploadedBankFile ? (
                              <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                    <div>
                                      <p className="font-bold text-xs text-slate-900 truncate max-w-[220px]">
                                        {uploadedBankFile.name}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-mono">
                                        {(uploadedBankFile.size / 1024).toFixed(1)} KB • {uploadedBankFile.rows.length}건 감지
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setUploadedBankFile(null);
                                      setUploadedStep(1);
                                      setUploadedReconciled(false);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition"
                                    title="파일 삭제"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="bg-white rounded-lg p-3 border border-emerald-100 flex items-center justify-between">
                                  <span className="text-xs text-slate-600 font-medium">파싱된 실입금 총액:</span>
                                  <span className="font-mono font-bold text-[#1E40AF] text-sm">
                                    ₩ {uploadedBankFile.totalAmount.toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => setFilePreviewType('bank')}
                                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
                                  >
                                    파싱 내역 미리보기 ({uploadedBankFile.rows.length}건)
                                  </button>
                                  <button
                                    onClick={() => bankFileInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                                  >
                                    다른 파일로 교체
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onDragOver={(e) => { e.preventDefault(); setIsBankDragging(true); }}
                                onDragLeave={() => setIsBankDragging(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsBankDragging(false);
                                  if (e.dataTransfer.files?.[0]) parseBankFile(e.dataTransfer.files[0]);
                                }}
                                onClick={() => bankFileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                  isBankDragging
                                    ? 'border-[#1E40AF] bg-blue-50/50 scale-[1.01]'
                                    : 'border-slate-200 hover:border-[#1E40AF] hover:bg-slate-50/80 bg-[#F8FAFC]'
                                }`}
                              >
                                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1E40AF] flex items-center justify-center mx-auto mb-3">
                                  <UploadCloud className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-bold text-slate-800">
                                  은행 통장 입금 엑셀 파일을 드래그하거나 클릭하여 업로드
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                  거래일시, 입금액, 적요/입금자명 컬럼을 자동으로 인식합니다.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* 구역 2: 플랫폼 정산 엑셀 원장 */}
                          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                              <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[11px]">B</span>
                                쇼핑몰/플랫폼 정산 내역 (정산서)
                              </span>
                              <span className="text-[10px] text-slate-400">네이버/쿠팡/자사몰 등</span>
                            </div>

                            {uploadedSettlementFile ? (
                              <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-[#1E40AF]" />
                                    <div>
                                      <p className="font-bold text-xs text-slate-900 truncate max-w-[220px]">
                                        {uploadedSettlementFile.name}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-mono">
                                        {(uploadedSettlementFile.size / 1024).toFixed(1)} KB • {uploadedSettlementFile.rows.length}개 주문 감지
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setUploadedSettlementFile(null);
                                      setUploadedStep(1);
                                      setUploadedReconciled(false);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition"
                                    title="파일 삭제"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="bg-white rounded-lg p-3 border border-blue-100 grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">매출 총액</span>
                                    <span className="font-mono font-bold text-slate-900">
                                      ₩ {uploadedSettlementFile.totalGross.toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px]">정산 실지급액</span>
                                    <span className="font-mono font-bold text-[#1E40AF]">
                                      ₩ {uploadedSettlementFile.totalSettled.toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => setFilePreviewType('settlement')}
                                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
                                  >
                                    주문별 공제 내역 미리보기 ({uploadedSettlementFile.rows.length}건)
                                  </button>
                                  <button
                                    onClick={() => settlementFileInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-[#1E40AF] hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition"
                                  >
                                    다른 파일로 교체
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onDragOver={(e) => { e.preventDefault(); setIsSettlementDragging(true); }}
                                onDragLeave={() => setIsSettlementDragging(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsSettlementDragging(false);
                                  if (e.dataTransfer.files?.[0]) parseSettlementFile(e.dataTransfer.files[0]);
                                }}
                                onClick={() => settlementFileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                  isSettlementDragging
                                    ? 'border-[#1E40AF] bg-blue-50/50 scale-[1.01]'
                                    : 'border-slate-200 hover:border-[#1E40AF] hover:bg-slate-50/80 bg-[#F8FAFC]'
                                }`}
                              >
                                <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
                                  <UploadCloud className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-bold text-slate-800">
                                  플랫폼 정산 엑셀 파일을 드래그하거나 클릭하여 업로드
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                  주문번호, 결제금액, 실지급액 및 수수료/반품/손실 컬럼을 인식합니다.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ======================================================== */}
                        {/* 4.1-B. 업로드 파일 2-Step 대사 실행 및 결과 검증         */}
                        {/* ======================================================== */}
                        {uploadedBankFile && uploadedSettlementFile ? (
                          (() => {
                            const diff = uploadedBankFile.totalAmount - uploadedSettlementFile.totalSettled;
                            const isMatch = Math.abs(diff) === 0;

                            return (
                              <div className="space-y-6">
                                {/* STEP 1: 업로드 파일 덩어리 대조 */}
                                <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-2xs">
                                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                      <span className="w-6 h-6 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs">
                                        1
                                      </span>
                                      <h3 className="font-bold text-sm text-[#0F172A]">
                                        1단계 : 덩어리 금액 대조 (업로드 통장 입금액 ↔ 정산 엑셀 실지급액)
                                      </h3>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">
                                      규칙: 1원 단위까지 100% 일치 시 2단계 주문 분해 통과
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                    {/* 좌측: 은행 통장 입금 총액 */}
                                    <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
                                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                        은행 계좌 실입금 (Bank Statement)
                                      </span>
                                      <div className="space-y-1.5 text-xs text-slate-600">
                                        <div className="flex justify-between">
                                          <span>파일명:</span>
                                          <strong className="text-slate-900 truncate max-w-[150px]">{uploadedBankFile.name}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>입금 건수:</span>
                                          <span>{uploadedBankFile.rows.length}건</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                          <span className="font-bold text-slate-700">통장 실입금 합계:</span>
                                          <strong className="text-base font-mono text-[#1E40AF]">
                                            ₩ {uploadedBankFile.totalAmount.toLocaleString()}
                                          </strong>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 중앙: 대조 검증 판정 */}
                                    <div className="text-center p-4 flex flex-col items-center justify-center">
                                      {isMatch ? (
                                        <div className="space-y-2">
                                          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                                            <CheckCheck className="w-6 h-6" />
                                          </div>
                                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            🟢 덩어리 금액 100% 일치
                                          </span>
                                          <p className="text-[11px] text-slate-400">오차 ₩ 0 (검증 성공)</p>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                                            <AlertOctagon className="w-6 h-6" />
                                          </div>
                                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                            ⚠️ 차액 ₩ {Math.abs(diff).toLocaleString()} 발생
                                          </span>
                                          <p className="text-[11px] text-rose-600 font-semibold">지급액 불일치 (정산 보류)</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* 우측: 정산 엑셀 실지급 합계 */}
                                    <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
                                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                        플랫폼 정산 엑셀 (Settlement Sheet)
                                      </span>
                                      <div className="space-y-1.5 text-xs text-slate-600">
                                        <div className="flex justify-between">
                                          <span>파일명:</span>
                                          <strong className="text-slate-900 truncate max-w-[150px]">{uploadedSettlementFile.name}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>매출 총액:</span>
                                          <span>₩ {uploadedSettlementFile.totalGross.toLocaleString()}</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                          <span className="font-bold text-slate-700">정산 실지급액:</span>
                                          <strong className="text-base font-mono text-slate-900">
                                            ₩ {uploadedSettlementFile.totalSettled.toLocaleString()}
                                          </strong>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 1단계 액션 바 */}
                                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                      {isMatch 
                                        ? '1단계 금액 대조가 성공적으로 검증되었습니다. 2단계 주문별 상세 리스크 분해를 진행할 수 있습니다.'
                                        : '⚠️ 금액이 일치하지 않습니다. 내부통제 원칙에 따라 차액을 미확인 가수금 보관함으로 격리해야 합니다.'}
                                    </span>

                                    {isMatch ? (
                                      <button
                                        onClick={() => setUploadedStep(2)}
                                        className="px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-900/20 transition flex items-center gap-2 active:scale-[0.98]"
                                      >
                                        <span>2단계: 주문별 4대 리스크 분해 진행</span>
                                        <ArrowRight className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={handleTransferUploadedDiffToSuspense}
                                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-900/20 transition flex items-center gap-2 active:scale-[0.98]"
                                      >
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>차액 ₩ {Math.abs(diff).toLocaleString()} 미확인 가수금으로 이관 & 대사 보류</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* STEP 2: 업로드 엑셀 주문별 상세 분해 매칭 */}
                                {uploadedStep === 2 && isMatch && (
                                  <div className="border border-blue-200 rounded-2xl p-6 bg-blue-50/20 shadow-xs animate-fadeIn">
                                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-blue-100">
                                      <div className="flex items-center gap-2.5">
                                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                                          2
                                        </span>
                                        <div>
                                          <h3 className="font-bold text-sm text-[#0F172A]">
                                            2단계 : 주문번호(Order Key) 기준 상세 분해 매칭
                                          </h3>
                                          <p className="text-xs text-slate-500 mt-0.5">
                                            업로드된 {uploadedSettlementFile.rows.length}개 주문의 차액을 4대 리스크(수수료, 반품, 파손, 기타)로 자동 분해 집계했습니다.
                                          </p>
                                        </div>
                                      </div>
                                      {uploadedReconciled ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                                          <Check className="w-3.5 h-3.5" />
                                          대사 확정 및 전사 리스크 DB 반영 완료
                                        </span>
                                      ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-[#1E40AF]">
                                          장부 반영 대기 중
                                        </span>
                                      )}
                                    </div>

                                    {/* 4대 리스크 총액 요약 카드 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                                      <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                          <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#1E40AF]" />
                                            정산수수료 (FEE)
                                          </span>
                                        </div>
                                        <div className="text-base font-bold font-mono text-[#0F172A]">
                                          ₩ {uploadedSettlementFile.totalFee.toLocaleString()}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">플랫폼 판매 및 결제 수수료</p>
                                      </div>

                                      <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                          <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                                            반품/취소 (RETURN)
                                          </span>
                                        </div>
                                        <div className="text-base font-bold font-mono text-[#0F172A]">
                                          ₩ {uploadedSettlementFile.totalReturn.toLocaleString()}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">고객 단순 변심 및 취소 환불</p>
                                      </div>

                                      <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                          <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                                            파손/사고 (DAMAGE)
                                          </span>
                                        </div>
                                        <div className="text-base font-bold font-mono text-[#0F172A]">
                                          ₩ {uploadedSettlementFile.totalDamage.toLocaleString()}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">배송 및 물류 파손 보상 차감</p>
                                      </div>

                                      <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                          <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                                            기타 (ETC)
                                          </span>
                                        </div>
                                        <div className="text-base font-bold font-mono text-[#0F172A]">
                                          ₩ {uploadedSettlementFile.totalEtc.toLocaleString()}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">프로모션 및 기타 공제</p>
                                      </div>
                                    </div>

                                    {/* 파싱된 개별 주문 내역 서브 테이블 */}
                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
                                      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-700">
                                          엑셀 원장 개별 주문 대사 리스트 ({uploadedSettlementFile.rows.length}건)
                                        </span>
                                        <span className="text-slate-400 text-[11px]">단위: 원</span>
                                      </div>
                                      <div className="overflow-x-auto max-h-60">
                                        <table className="w-full text-left text-xs">
                                          <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-200 sticky top-0 text-[11px]">
                                            <tr>
                                              <th className="px-4 py-2.5 whitespace-nowrap">주문번호</th>
                                              <th className="px-4 py-2.5 whitespace-nowrap">플랫폼</th>
                                              <th className="px-4 py-2.5 whitespace-nowrap">상품명 / 주문자</th>
                                              <th className="px-4 py-2.5 text-right whitespace-nowrap">결제금액</th>
                                              <th className="px-4 py-2.5 text-right whitespace-nowrap">정산실지급액</th>
                                              <th className="px-4 py-2.5 text-right whitespace-nowrap">수수료(FEE)</th>
                                              <th className="px-4 py-2.5 text-right whitespace-nowrap">반품(RETURN)</th>
                                              <th className="px-4 py-2.5 text-right whitespace-nowrap">파손(DAMAGE)</th>
                                              <th className="px-4 py-2.5 text-right whitespace-nowrap">기타(ETC)</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {uploadedSettlementFile.rows.map((row, idx) => (
                                              <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-4 py-2.5 font-mono font-bold text-[#1E40AF] whitespace-nowrap">
                                                  <div>{row.orderKey}</div>
                                                  <div className="text-[10px] text-slate-400 font-sans">{row.date}</div>
                                                </td>
                                                <td className="px-4 py-2.5 whitespace-nowrap text-slate-700">
                                                  {row.platform}
                                                </td>
                                                <td className="px-4 py-2.5 whitespace-nowrap text-slate-800">
                                                  <div className="font-medium text-xs">{row.productName || '기본 품목'}</div>
                                                  {row.customer && row.customer !== '-' && (
                                                    <div className="text-[11px] text-slate-400">주문자: {row.customer}</div>
                                                  )}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono text-slate-900 whitespace-nowrap">
                                                  ₩ {row.grossAmount.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                                                  ₩ {row.settledAmount.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono text-[#1E40AF] whitespace-nowrap">
                                                  {row.fee > 0 ? `₩ ${row.fee.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono text-rose-600 whitespace-nowrap">
                                                  {row.returnLoss > 0 ? `₩ ${row.returnLoss.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono text-sky-600 whitespace-nowrap">
                                                  {row.damage > 0 ? `₩ ${row.damage.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono text-slate-500 whitespace-nowrap">
                                                  {row.etc > 0 ? `₩ ${row.etc.toLocaleString()}` : '-'}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>

                                    {/* 2단계 최종 확정 버튼 */}
                                    <div className="flex items-center justify-end gap-3">
                                      <button
                                        disabled={uploadedReconciled || currentRole === 'viewer'}
                                        onClick={handleConfirmUploadedReconciliation}
                                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center gap-2 active:scale-[0.98]"
                                      >
                                        <CheckCheck className="w-4 h-4" />
                                        <span>
                                          {uploadedReconciled ? '전사 장부 반영 완료됨' : '2-Step 최종 대사 확정 & Risk DB 동기화'}
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <span>위의 A(은행 통장 엑셀)와 B(플랫폼 정산 엑셀) 두 파일을 모두 업로드하면 2-Step 자동 대사가 즉시 활성화됩니다.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ======================================================== */
                      /* 4.1-C. 데모 프리셋 시나리오 (네이버/쿠팡)                */
                      /* ======================================================== */
                      <div className="space-y-6">
                        {/* 정산 배치 선택기 (3가지 케이스) */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <FileSpreadsheet className="w-4 h-4 text-[#1E40AF]" />
                            <span>검증할 정산 배치 선택:</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => {
                                setB2cBatch('naver');
                                setB2cStep(1);
                                setB2cReconciled(false);
                                setPartialApproved(false);
                                setDisputeSuccessOrder(null);
                                setCheckedOrderKeys({});
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                b2cBatch === 'naver'
                                  ? 'bg-white text-[#1E40AF] border border-[#1E40AF] shadow-2xs font-bold'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              🟢 네이버 스마트스토어 10월 정산 (정상 일치 예시)
                            </button>
                            <button
                              onClick={() => {
                                setB2cBatch('coupang_match');
                                setB2cStep(1);
                                setB2cReconciled(false);
                                setPartialApproved(false);
                                setDisputeSuccessOrder(null);
                                setCheckedOrderKeys({});
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                b2cBatch === 'coupang_match'
                                  ? 'bg-white text-emerald-700 border border-emerald-600 shadow-2xs font-bold'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              🟢 쿠팡 로켓배송 10월 정산 (정상 일치 예시)
                            </button>
                            <button
                              onClick={() => {
                                setB2cBatch('coupang_mismatch');
                                setB2cStep(1);
                                setB2cReconciled(false);
                                setPartialApproved(false);
                                setDisputeSuccessOrder(null);
                                setCheckedOrderKeys({});
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                b2cBatch === 'coupang_mismatch'
                                  ? 'bg-white text-rose-600 border border-rose-300 shadow-2xs font-bold'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              ⚠️ 쿠팡 로켓배송 정산 (미정산 1건 발생)
                            </button>
                          </div>
                        </div>

                        {/* STEP 1: 덩어리 금액 대조 */}
                        {(() => {
                          const isMatch = b2cBatch !== 'coupang_mismatch';
                          const batchPlatformName = b2cBatch === 'naver' ? '네이버 스마트스토어' : '쿠팡 로켓배송';
                          const batchSenderName = b2cBatch === 'naver' ? '네이버페이 정산' : '쿠팡_정산지급';
                          const batchAccount = b2cBatch === 'naver' ? '기업은행 010-1234-5678' : '하나은행 220-456-78901';
                          const batchDate = b2cBatch === 'naver' ? '2026-10-20' : '2026-10-22';
                          const batchBankDeposit = b2cBatch === 'naver' ? 42300000 : b2cBatch === 'coupang_match' ? 76260000 : 75000000;
                          const batchGross = b2cBatch === 'naver' ? 45000000 : 82000000;
                          const batchDeduction = b2cBatch === 'naver' ? 2700000 : 5740000;
                          const batchPayout = b2cBatch === 'naver' ? 42300000 : 76260000;

                          return (
                            <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-2xs">
                              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-6 h-6 rounded-full bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs">
                                    1
                                  </span>
                                  <h3 className="font-bold text-sm text-[#0F172A]">
                                    1단계 : 덩어리 금액 대조 (은행 통장 입금액 ↔ 플랫폼 정산 엑셀 총지급액)
                                  </h3>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">
                                  규칙: 1원 단위까지 100% 일치 시에만 상세 매칭 통과
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                {/* 좌측: 은행 통장 입금 내역 */}
                                <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                    은행 계좌 실입금 (Bank Statement)
                                  </span>
                                  <div className="space-y-1.5 text-xs text-slate-600">
                                    <div className="flex justify-between">
                                      <span>입금처:</span>
                                      <strong className="text-slate-900">{batchSenderName}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>거래일시:</span>
                                      <span>{batchDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>계좌:</span>
                                      <span className="font-mono">{batchAccount}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                      <span className="font-bold text-slate-700">통장 실입금액:</span>
                                      <strong className="text-base font-mono text-[#1E40AF]">
                                        ₩ {batchBankDeposit.toLocaleString()}
                                      </strong>
                                    </div>
                                  </div>
                                </div>

                                {/* 중앙: 대조 검증 판정 */}
                                <div className="text-center p-4 flex flex-col items-center justify-center">
                                  {isMatch ? (
                                    <div className="space-y-2">
                                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                                        <CheckCheck className="w-6 h-6" />
                                      </div>
                                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        🟢 덩어리 금액 100% 일치
                                      </span>
                                      <p className="text-[11px] text-slate-400">오차 ₩ 0 (검증 성공)</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                                        <AlertOctagon className="w-6 h-6" />
                                      </div>
                                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                        ⚠️ 미정산 1건 (₩ 1,260,000) 감지
                                      </span>
                                      <p className="text-[11px] text-rose-600 font-semibold">원장 대비 1건 미정산 (보류)</p>
                                    </div>
                                  )}
                                </div>

                                {/* 우측: 정산 엑셀 총지급액 */}
                                <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                    플랫폼 정산 엑셀 (Settlement Sheet)
                                  </span>
                                  <div className="space-y-1.5 text-xs text-slate-600">
                                    <div className="flex justify-between">
                                      <span>플랫폼:</span>
                                      <strong className="text-slate-900">{batchPlatformName}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>판매 총액:</span>
                                      <span>₩ {batchGross.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-rose-600">
                                      <span>공제 총액:</span>
                                      <span>- ₩ {batchDeduction.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                      <span className="font-bold text-slate-700">정산 실지급액:</span>
                                      <strong className="text-base font-mono text-slate-900">
                                        ₩ {batchPayout.toLocaleString()}
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 1단계 액션 바 (한 줄 정렬) */}
                              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-xs text-slate-600 min-w-0">
                                  {isMatch ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span className="truncate">1단계 덩어리 금액 대조 완료 (오차 0원). 2단계 주문별 상세 분해를 진행할 수 있습니다.</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                      <span className="truncate">
                                        통장 입금액(₩ 75,000,000) 대비 <strong>미정산 1건 (₩ 1,260,000)</strong> 감지 → 2단계에서 <strong>정산 안 된 주문건과 사유(내역없음)</strong>를 확인하세요.
                                      </span>
                                    </>
                                  )}
                                </div>

                                <button
                                  onClick={() => setB2cStep(2)}
                                  className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0 active:scale-95 whitespace-nowrap ${
                                    isMatch
                                      ? 'bg-[#1E40AF] hover:bg-blue-800 shadow-blue-900/20'
                                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20'
                                  }`}
                                >
                                  <span>2단계: 주문번호별 매칭 & 미정산 주문 확인</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                        {/* STEP 2: 상세 내역 분해 매칭 (네이버 / 쿠팡) */}
                        {b2cStep === 2 && (() => {
                          const isMatch = b2cBatch !== 'coupang_mismatch';
                          const batchPlatformName = b2cBatch === 'naver' ? '네이버 스마트스토어' : '쿠팡 로켓배송';
                          const activeOrders = b2cBatch === 'naver' 
                            ? NAVER_DEMO_ORDERS 
                            : b2cBatch === 'coupang_match' 
                              ? COUPANG_DEMO_ORDERS 
                              : COUPANG_MISMATCH_DEMO_ORDERS;

                          const totalGross = activeOrders.reduce((acc, cur) => acc + cur.grossAmount, 0);
                          const totalSettled = activeOrders.reduce((acc, cur) => acc + cur.settledAmount, 0);
                          const totalExpected = activeOrders.reduce((acc, cur) => acc + (cur.expectedSettledAmount || cur.settledAmount), 0);
                          const totalDiff = activeOrders.reduce((acc, cur) => acc + (cur.diffAmount || 0), 0);
                          const totalFee = activeOrders.reduce((acc, cur) => acc + cur.fee, 0);
                          const totalReturn = activeOrders.reduce((acc, cur) => acc + cur.returnLoss, 0);
                          const totalDamage = activeOrders.reduce((acc, cur) => acc + cur.damage, 0);
                          const totalEtc = activeOrders.reduce((acc, cur) => acc + cur.etc, 0);
                          const totalDeductions = totalFee + totalReturn + totalDamage + totalEtc;

                          const filteredDemoList = activeOrders.filter(ord => {
                            const query = presetOrderSearch.trim().toLowerCase();
                            const matchQuery = !query ||
                              ord.orderKey.toLowerCase().includes(query) ||
                              ord.productName.toLowerCase().includes(query) ||
                              ord.customer.includes(query);

                            if (!matchQuery) return false;

                            if (presetOrderFilter === 'DEDUCTED') {
                              return ord.returnLoss > 0 || ord.damage > 0 || (ord.diffAmount && ord.diffAmount !== 0);
                            }
                            if (presetOrderFilter === 'NORMAL') {
                              return ord.returnLoss === 0 && ord.damage === 0 && (!ord.diffAmount || ord.diffAmount === 0);
                            }
                            return true;
                          });

                          return (
                            <div className="border border-blue-200 rounded-2xl p-6 bg-blue-50/20 shadow-xs animate-fadeIn space-y-5">
                              {/* 2단계 헤더 */}
                              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-blue-100 gap-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                    2
                                  </span>
                                  <div>
                                    <h3 className="font-bold text-sm text-[#0F172A]">
                                      2단계 : 주문번호(Order Key) 기준 상세 매칭 (환불 여부 및 실정산액 확인)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      통장 총액 확인 후, {batchPlatformName} 정산 엑셀 내 주문번호별로 환불/반품 발생 여부와 실제 정산된 금액을 대조·확인합니다.
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  {isMatch ? (
                                    b2cReconciled ? (
                                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5" />
                                        대사 및 원장 반영 완료
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-[#1E40AF]">
                                        {activeOrders.length}건 상세 대사 대기 중
                                      </span>
                                    )
                                  ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      미정산 1건 감지 (-₩ 1,260,000)
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* 쿠팡 미정산 발생 시 주문번호별 점검 안내 배너 */}
                              {b2cBatch === 'coupang_mismatch' && (
                                <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                  <div className="leading-relaxed">
                                    <div className="font-bold text-sm text-amber-950 mb-0.5">
                                      주문번호별 정산 대사 점검 (총 8건 중 1건 미정산 주문 감지)
                                    </div>
                                    <div>
                                      정상 정산 주문은 <strong>[원금액 = 실금액 + 수수료 등 차감액]</strong>으로 100% 일치합니다.  
                                      다만 이 기간에 원장에 들어온 주문 8건 중 <strong>주문번호 CP-20261012-0205(₩ 1,260,000)는 고객 정산보류로 엑셀에 내역이 없어 미정산(실금액 ₩ 0)</strong>되었습니다.  
                                      ➔ <strong>정상 7건(₩ 75,000,000)은 정산 승인</strong>하고, <strong>미정산 1건은 미수금으로 확정하여 영업팀에 사유 확인을 전달</strong>하세요.
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 배치 요약 통계 카드 */}
                              <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pb-4 border-b border-slate-100">
                                  <div>
                                    <span className="text-slate-400 block mb-1">배치 정산 주문수</span>
                                    <strong className="font-mono text-sm text-[#1E40AF]">{activeOrders.length}건 전체</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block mb-1">최초 매출 원장 발생액</span>
                                    <strong className="text-sm text-slate-900">₩ {totalGross.toLocaleString()}</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block mb-1">정산 실지급 합계</span>
                                    <strong className="text-sm text-emerald-600">₩ {totalSettled.toLocaleString()}</strong>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block mb-1">총 공제 및 미정산액</span>
                                    <strong className="text-sm text-rose-600">
                                      - ₩ {(totalDeductions + Math.abs(totalDiff)).toLocaleString()}
                                    </strong>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                                    공제 및 미정산 내역 자동 분해 (수수료 / 반품 / 파손 / 미정산)
                                  </span>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                        <span className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-[#1E40AF]" />
                                          정산수수료 (FEE)
                                        </span>
                                      </div>
                                      <div className="text-sm font-bold font-mono text-[#0F172A]">
                                        ₩ {totalFee.toLocaleString()}
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5">결제 및 플랫폼 입점 수수료</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                        <span className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                                          반품/환불 (RETURN)
                                        </span>
                                        <span className="text-rose-600 font-bold">
                                          {activeOrders.filter(o => o.returnLoss > 0).length}건
                                        </span>
                                      </div>
                                      <div className="text-sm font-bold font-mono text-rose-600">
                                        ₩ {totalReturn.toLocaleString()}
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5">고객 단순 변심 및 반품 환불</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                        <span className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                                          파손/사고 (DAMAGE)
                                        </span>
                                        <span className="text-sky-600 font-bold">
                                          {activeOrders.filter(o => o.damage > 0).length}건
                                        </span>
                                      </div>
                                      <div className="text-sm font-bold font-mono text-sky-600">
                                        ₩ {totalDamage.toLocaleString()}
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5">배송 중 파손 손실 보상</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                        <span className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                                          미정산 주문 (HOLD)
                                        </span>
                                        <span className="text-rose-600 font-bold">
                                          {activeOrders.filter(o => o.diffAmount && o.diffAmount !== 0).length}건
                                        </span>
                                      </div>
                                      <div className={`text-sm font-bold font-mono ${totalDiff !== 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                        {totalDiff !== 0 ? `- ₩ ${Math.abs(totalDiff).toLocaleString()}` : '₩ 0'}
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        {totalDiff !== 0 ? '고객 정산보류로 엑셀 미반영' : '오차 없음 (전건 정산됨)'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 개별 주문 비교 대사 테이블 (주문번호별 체크 및 차액 사유 분석) */}
                              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                                <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800">
                                      주문번호별 상세 대사 리스트 ({filteredDemoList.length} / {activeOrders.length}건)
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      (주문번호마다 정산 예정액과 실제 지급액을 비교하여 차액 사유를 확인합니다)
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* 검색창 */}
                                    <div className="relative">
                                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                      <input
                                        type="text"
                                        placeholder="주문번호, 상품명, 고객명..."
                                        value={presetOrderSearch}
                                        onChange={(e) => setPresetOrderSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#1E40AF] w-48"
                                      />
                                    </div>

                                    {/* 필터 칩 */}
                                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                      <button
                                        onClick={() => setPresetOrderFilter('ALL')}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                                          presetOrderFilter === 'ALL'
                                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                      >
                                        전체 ({activeOrders.length})
                                      </button>
                                      <button
                                        onClick={() => setPresetOrderFilter('DEDUCTED')}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                                          presetOrderFilter === 'DEDUCTED'
                                            ? 'bg-white text-rose-600 shadow-2xs font-bold'
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                      >
                                        차감/보류 발생 ({activeOrders.filter(o => o.returnLoss > 0 || o.damage > 0 || (o.diffAmount && o.diffAmount !== 0)).length})
                                      </button>
                                      <button
                                        onClick={() => setPresetOrderFilter('NORMAL')}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                                          presetOrderFilter === 'NORMAL'
                                            ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                                            : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                      >
                                        정상 ({activeOrders.filter(o => o.returnLoss === 0 && o.damage === 0 && (!o.diffAmount || o.diffAmount === 0)).length})
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="overflow-x-auto max-h-96">
                                  <table className="w-full text-left text-xs table-fixed">
                                    <colgroup>
                                      <col className="w-10" />
                                      <col className="w-36" />
                                      <col className="w-48" />
                                      <col className="w-28" />
                                      <col className="w-28" />
                                      <col className="w-28" />
                                      <col className="w-28" />
                                      <col className="w-52" />
                                    </colgroup>
                                    <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-200 sticky top-0 text-[11px]">
                                      <tr>
                                        <th className="px-3 py-2.5 text-center whitespace-nowrap">
                                          <input
                                            type="checkbox"
                                            checked={activeOrders.length > 0 && activeOrders.every(o => checkedOrderKeys[o.orderKey] ?? (!o.diffAmount || o.diffAmount === 0))}
                                            onChange={(e) => {
                                              const next: Record<string, boolean> = {};
                                              activeOrders.forEach(o => { next[o.orderKey] = e.target.checked; });
                                              setCheckedOrderKeys(next);
                                            }}
                                            className="rounded border-slate-300 text-[#1E40AF] focus:ring-0 cursor-pointer"
                                            title="전체 선택/해제"
                                          />
                                        </th>
                                        <th className="px-3 py-2.5 whitespace-nowrap">주문번호 / 일자</th>
                                        <th className="px-3 py-2.5 whitespace-nowrap">상품명 / 주문 고객</th>
                                        <th className="px-3 py-2.5 text-right whitespace-nowrap">결제금액 (원금액)</th>
                                        <th className="px-3 py-2.5 text-right whitespace-nowrap">수수료 차감</th>
                                        <th className="px-3 py-2.5 text-right whitespace-nowrap">환불/반품 차감</th>
                                        <th className="px-3 py-2.5 text-right whitespace-nowrap">실제 정산금액 (실금액)</th>
                                        <th className="px-4 py-2.5 text-center whitespace-nowrap">정산 상태 & 사유</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {filteredDemoList.map((ord) => {
                                        const hasDiff = ord.diffAmount && ord.diffAmount !== 0;
                                        const refundAmount = ord.returnLoss + ord.damage;
                                        const isChecked = checkedOrderKeys[ord.orderKey] ?? !hasDiff;

                                        return (
                                          <tr
                                            key={ord.orderKey}
                                            className={`transition ${
                                              hasDiff ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50/80'
                                            }`}
                                          >
                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                              <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                  setCheckedOrderKeys(prev => ({
                                                    ...prev,
                                                    [ord.orderKey]: e.target.checked
                                                  }));
                                                }}
                                                className="rounded border-slate-300 text-[#1E40AF] focus:ring-0 cursor-pointer"
                                              />
                                            </td>
                                            <td className="px-3 py-2.5 font-mono font-bold text-[#1E40AF] whitespace-nowrap">
                                              <div>{ord.orderKey}</div>
                                              <div className="text-[10px] text-slate-400 font-sans font-normal">{ord.date}</div>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap text-slate-900 truncate">
                                              <div className="font-semibold text-xs text-slate-800 truncate" title={ord.productName}>{ord.productName}</div>
                                              <div className="text-[11px] text-slate-400 font-normal">주문자: {ord.customer}</div>
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                                              ₩ {ord.grossAmount.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-mono text-slate-500 whitespace-nowrap">
                                              {ord.fee > 0 ? `- ₩ ${ord.fee.toLocaleString()}` : <span className="text-slate-300">-</span>}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                                              {refundAmount > 0 ? (
                                                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                                  - ₩ {refundAmount.toLocaleString()}
                                                </span>
                                              ) : (
                                                <span className="text-slate-300">-</span>
                                              )}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                                              {ord.settledAmount > 0 ? (
                                                <span className="font-bold text-emerald-700">
                                                  ₩ {ord.settledAmount.toLocaleString()}
                                                </span>
                                              ) : (
                                                <span className="text-slate-400 font-mono font-medium">₩ 0</span>
                                              )}
                                            </td>
                                            <td className="px-4 py-2.5 text-center whitespace-nowrap">
                                              {hasDiff ? (
                                                <span 
                                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap"
                                                  title="사유: 내역없음 (고객 정산보류로 정산 엑셀에 미포함되어 조회가 안 됨)"
                                                >
                                                  ⚠️ 미정산 (내역없음)
                                                </span>
                                              ) : ord.damage > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
                                                  🔵 파손 차감 정산
                                                </span>
                                              ) : ord.returnLoss > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                                                  🔴 반품/환불 차감 정산
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                                  🟢 전액 정산 완료
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                    <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-slate-800 text-xs">
                                      <tr>
                                        <td className="px-3 py-2.5 text-center whitespace-nowrap">합계</td>
                                        <td className="px-3 py-2.5 whitespace-nowrap" colSpan={2}>
                                          {filteredDemoList.length}건 주문 내역
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                                          ₩ {filteredDemoList.reduce((sum, o) => sum + o.grossAmount, 0).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono text-slate-500 whitespace-nowrap">
                                          - ₩ {filteredDemoList.reduce((sum, o) => sum + o.fee, 0).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono text-rose-600 whitespace-nowrap">
                                          - ₩ {filteredDemoList.reduce((sum, o) => sum + (o.returnLoss + o.damage), 0).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono text-emerald-700 whitespace-nowrap">
                                          ₩ {filteredDemoList.reduce((sum, o) => sum + o.settledAmount, 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-slate-500 font-normal whitespace-nowrap">
                                          {totalDiff !== 0 ? '7건 정산 완료 / 1건 미정산' : '전건 정상 정산 완료'}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>

                              {/* 하단 액션 버튼 (정상 건 개별 승인 및 차액 건 미수금 확정/영업팀 전달) */}
                              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                <div className="text-xs text-slate-600">
                                  {isMatch ? (
                                    <span>
                                      총 {activeOrders.length}건 주문이 통장 입금액(₩ {totalSettled.toLocaleString()})과 100% 일치합니다.
                                    </span>
                                  ) : (
                                    <span>
                                      총 {activeOrders.length}건 중 <strong className="text-emerald-700">정상 7건 (₩ 75,000,000)</strong>은 개별 승인하고, <strong className="text-rose-600">내역없음 1건 (-₩ 1,260,000)</strong>은 미수금으로 확정하여 영업팀에 이관합니다.
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                  {isMatch ? (
                                    <button
                                      disabled={b2cReconciled || currentRole === 'viewer'}
                                      onClick={() => {
                                        setB2cReconciled(true);
                                        const orderKeys = activeOrders.map(o => o.orderKey);
                                        setSalesRecords(prev => prev.map(s => orderKeys.includes(s.order_key) ? { ...s, status: 'PAID' } : s));
                                        
                                        const newAudit = {
                                          id: `a-${Date.now()}`,
                                          action_type: 'AUTO_2STEP_RECONCILE',
                                          target_id: `${batchPlatformName} (8건)`,
                                          actor_email: 'system@auto.reconcile',
                                          actor_role: currentRole,
                                          memo: `${batchPlatformName} 8개 개별 주문 대사 확정 및 리스크 공제(₩ ${totalDeductions.toLocaleString()}) DB 동기화 완료`,
                                          amount: totalSettled,
                                          created_at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                                        };
                                        setAuditLogs(prev => [newAudit, ...prev]);

                                        setActionSuccessMsg(`[2-Step 대사 완료] ${batchPlatformName} 8개 개별 주문(총 ₩ ${totalGross.toLocaleString()}) 대사가 확정되었으며, 장부 동기화가 완료되었습니다.`);
                                        setTimeout(() => setActionSuccessMsg(''), 4500);
                                      }}
                                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center gap-2 active:scale-[0.98]"
                                    >
                                      <CheckCheck className="w-4 h-4" />
                                      <span>
                                        {b2cReconciled ? '8건 주문 대사 및 장부 반영 완료됨' : '8건 주문 2-Step 최종 대사 확정'}
                                      </span>
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        disabled={partialApproved || currentRole === 'viewer'}
                                        onClick={() => {
                                          setPartialApproved(true);
                                          const normalKeys = COUPANG_MISMATCH_DEMO_ORDERS.filter(o => !o.diffAmount || o.diffAmount === 0).map(o => o.orderKey);
                                          setSalesRecords(prev => prev.map(s => normalKeys.includes(s.order_key) ? { ...s, status: 'PAID' } : s));
                                          
                                          const newAudit = {
                                            id: `a-${Date.now()}`,
                                            action_type: 'PARTIAL_RECONCILE',
                                            target_id: '쿠팡 로켓배송 (정상 7건)',
                                            actor_email: 'finance@manager.corp',
                                            actor_role: currentRole,
                                            memo: '쿠팡 10월 정산 중 정상 확인된 7건 개별 주문 대사 확정 승인 (₩ 75,000,000)',
                                            amount: 75000000,
                                            created_at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                                          };
                                          setAuditLogs(prev => [newAudit, ...prev]);
                                          setActionSuccessMsg('[정산 승인 완료] 정상 확인된 7건 주문(₩ 75,000,000)의 대사가 확정되어 원장에 정산 완료 반영되었습니다.');
                                          setTimeout(() => setActionSuccessMsg(''), 4500);
                                        }}
                                        className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center gap-2 active:scale-95 ${
                                          partialApproved
                                            ? 'bg-slate-400 cursor-not-allowed'
                                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'
                                        }`}
                                      >
                                        <CheckCheck className="w-4 h-4" />
                                        <span>
                                          {partialApproved ? '정상 7건 대사 승인 완료됨' : '정상 확인 7건 정산 승인 (₩ 75,000,000)'}
                                        </span>
                                      </button>

                                      <button
                                        disabled={disputeSuccessOrder !== null || currentRole === 'viewer'}
                                        onClick={() => {
                                          setDisputeSuccessOrder('CP-20261012-0205');
                                          const newAudit = {
                                            id: `a-${Date.now()}`,
                                            action_type: 'AR_MISMATCH_RECORD',
                                            target_id: 'CP-20261012-0205',
                                            actor_email: 'finance@manager.corp',
                                            actor_role: currentRole,
                                            memo: '주문 CP-20261012-0205 정산 엑셀 내역없음(고객 정산보류) 확인 (차액 ₩ 1,260,000 미수금 확정 및 영업팀 사유확인 전달)',
                                            amount: 1260000,
                                            created_at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                                          };
                                          setAuditLogs(prev => [newAudit, ...prev]);
                                          setActionSuccessMsg('[미수금 확정 완료] 엑셀 내역없음 건(CP-20261012-0205, ₩ 1,260,000)이 미수채권으로 확정되었으며, 영업팀에 사유 확인 요청이 전달되었습니다.');
                                          setTimeout(() => setActionSuccessMsg(''), 5000);
                                        }}
                                        className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center gap-2 active:scale-95 ${
                                          disputeSuccessOrder
                                            ? 'bg-slate-400 cursor-not-allowed'
                                            : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20'
                                        }`}
                                      >
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>
                                          {disputeSuccessOrder ? '미수금 확정 및 영업팀 전달 완료' : '내역없음 1건(₩ 1,260,000) 미수금 확정 (영업팀 전달)'}
                                        </span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  /* ======================================================== */
                  /* 4.2. B2B 텍스트 + 금액 매칭 (세금계산서 / 대표자명 교차)  */
                  /* ======================================================== */
                  <div className="pt-6 space-y-6">
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-[#1E40AF] shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong>B2B 지능형 적요 매칭 엔진</strong>: 은행 통장 적요란에 법인명이 아닌 <strong>대표자 개인명</strong>이 찍혀 입금되더라도, 
                        거래처 마스터의 <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">ceo_name</code>과 대조하여 청구 금액이 일치하면 동일 거래처로 판별하여 매칭을 제안합니다.
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#1E40AF]" />
                            B2B 미대사 은행 입금 ↔ 미수금 원장 자동 대조 목록
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            통장 적요와 금액을 바탕으로 매칭 후보를 분석한 결과입니다.
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                            <tr>
                              <th className="px-5 py-3.5">입금 일시 / 은행</th>
                              <th className="px-5 py-3.5">통장 적요 (텍스트)</th>
                              <th className="px-5 py-3.5 text-right">입금액</th>
                              <th className="px-5 py-3.5">시스템 지능형 매칭 제안</th>
                              <th className="px-5 py-3.5 text-center">대사 조치</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {/* 케이스 1: 대표자명 교차 매칭 (홍길동 -> (주)알파테크) */}
                            <tr className="hover:bg-slate-50/80 transition">
                              <td className="px-5 py-4 text-slate-600">
                                2026-10-22 14:20<br />
                                <span className="text-[11px] text-slate-400 font-mono">기업은행</span>
                              </td>
                              <td className="px-5 py-4">
                                <strong className="font-bold text-slate-900 block text-sm">홍길동</strong>
                                <span className="text-[11px] text-slate-400">대표자 개인명 송금</span>
                              </td>
                              <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                                ₩ 15,000,000
                              </td>
                              <td className="px-5 py-4">
                                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 space-y-1">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E40AF]">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    대표자명 교차 일치 (청구액 100% 일치)
                                  </span>
                                  <div className="text-[11px] text-slate-600">
                                    추정 법인: <strong>(주)알파테크</strong> (대표: 홍길동)<br />
                                    연동 미수금: <code className="font-mono text-[#1E40AF]">INV-20261005-003</code> (₩ 15,000,000)
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                {b2bReconciledIds.includes('INV-20261005-003') ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                    <Check className="w-3.5 h-3.5" />
                                    매칭 승인 완료
                                  </span>
                                ) : (
                                  <button
                                    disabled={currentRole === 'viewer'}
                                    onClick={() => {
                                      setB2bReconciledIds(prev => [...prev, 'INV-20261005-003']);
                                      setSalesRecords(prev => prev.map(s => s.order_key === 'INV-20261005-003' ? { ...s, status: 'PAID' } : s));
                                      setActionSuccessMsg(`[B2B 매칭 승인] 대표자 홍길동 명의 입금 ₩ 15,000,000원이 (주)알파테크 미수금과 성공적으로 상계되었습니다.`);
                                      setTimeout(() => setActionSuccessMsg(''), 4000);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-[#1E40AF] hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition"
                                  >
                                    원클릭 매칭 승인
                                  </button>
                                )}
                              </td>
                            </tr>

                            {/* 케이스 2: 동명/동일 금액 중복 충돌 (김철수 500만원) */}
                            <tr className="hover:bg-slate-50/80 transition bg-amber-50/20">
                              <td className="px-5 py-4 text-slate-600">
                                2026-10-21 11:05<br />
                                <span className="text-[11px] text-slate-400 font-mono">우리은행</span>
                              </td>
                              <td className="px-5 py-4">
                                <strong className="font-bold text-slate-900 block text-sm">김철수</strong>
                                <span className="text-[11px] text-amber-700 font-semibold">동명 대표자 충돌</span>
                              </td>
                              <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                                ₩ 5,000,000
                              </td>
                              <td className="px-5 py-4">
                                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    동일 명의 거래처 2건 중복 감지 (자동 매칭 중단)
                                  </span>
                                  <div className="text-[11px] text-slate-600">
                                    후보 1: <strong>(주)베타로지스</strong> (대표: 김철수, 500만원)<br />
                                    후보 2: <strong>(주)감마글로벌</strong> (대표: 김철수, 500만원)
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <button
                                  onClick={() => {
                                    const conflictItem = suspenseList.find(s => s.sender_name === '김철수') || {
                                      id: 'sp-1',
                                      sender_name: '김철수',
                                      amount: 5000000,
                                      reason: 'DUPLICATE_CANDIDATES',
                                      status: 'PENDING',
                                      conflict_count: 2
                                    };
                                    setConflictModalItem(conflictItem);
                                  }}
                                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition"
                                >
                                  ⚠️ 조회 및 수동 연결
                                </button>
                              </td>
                            </tr>

                            {/* 케이스 3: 미등록 거래처 (미확인 입금) */}
                            <tr className="hover:bg-slate-50/80 transition">
                              <td className="px-5 py-4 text-slate-600">
                                2026-10-20 09:30<br />
                                <span className="text-[11px] text-slate-400 font-mono">신한은행</span>
                              </td>
                              <td className="px-5 py-4">
                                <strong className="font-bold text-slate-900 block text-sm">(주)모름파트너스</strong>
                                <span className="text-[11px] text-slate-400">미등록 적요</span>
                              </td>
                              <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                                ₩ 3,200,000
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-[11px] text-slate-500">
                                  거래처 DB 및 미수금 청구 내역 없음 ➔ 미확인 보관함(가수금) 적재 완료
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                                  가수금 관리 대기
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'suspense' ? (
            /* ============================================================== */
            /* 5. 미확인 가수금 & 내부통제 센터 (PRD 5.2 구현)                */
            /* ============================================================== */
            <div className="space-y-6">
              {/* RLS 보안 상태 카드 */}
              <div className={`p-6 rounded-2xl border transition ${
                currentRole === 'viewer'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-blue-50/70 border-blue-200 text-blue-950'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      currentRole === 'viewer' ? 'bg-amber-100 text-amber-700' : 'bg-[#1E40AF] text-white'
                    }`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#0F172A]">
                        {currentRole === 'viewer' 
                          ? '🔒 Supabase RLS 정책 적용 중: 영업 관리자 열람 불가' 
                          : '✅ Supabase RLS 인증 통과: 자금팀 관리자 통제 활성화'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                        {currentRole === 'viewer' ? (
                          <>
                            영업 담당자의 실적 오인 및 미확인 자금 유출을 방지하기 위해, PostgreSQL RLS
                            (<code className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono text-amber-800">suspense_amounts_select_policy</code>)
                            가 작동하여 DB 엔진 레벨에서 쿼리가 원천 차단됩니다.
                          </>
                        ) : (
                          <>
                            자금팀 관리자 및 경영진 전용 통제 센터입니다. 불일치 입금 및 동명 거래처 충돌 건을 육안 대조 후 수동 분개하며, 모든 조치는 <strong>감사 로그(Audit Trail)</strong>에 영구 보존됩니다.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-slate-600 font-semibold shadow-2xs">
                    Table: public.suspense_amounts
                  </span>
                </div>
              </div>

              {/* 가수금 요약 통계 4종 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-xs text-slate-400 block mb-1">총 미확인 가수금</span>
                  <div className="text-xl font-bold font-mono text-[#1E40AF]">
                    {currentRole === 'viewer' ? '[RLS 차단]' : `₩ ${totalSuspense.toLocaleString()}`}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
                  <span className="text-xs text-amber-700 block mb-1 font-semibold">⚠️ 동명 거래처 충돌</span>
                  <div className="text-xl font-bold font-mono text-amber-700">
                    {currentRole === 'viewer' ? '-' : `${suspenseList.filter(s => s.reason === 'DUPLICATE_CANDIDATES').length} 건`}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-xs text-slate-400 block mb-1">정산 차액 불일치</span>
                  <div className="text-xl font-bold font-mono text-rose-600">
                    {currentRole === 'viewer' ? '-' : `${suspenseList.filter(s => s.reason.includes('UNMATCHED')).length} 건`}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-xs text-slate-400 block mb-1">미등록 적요 입금</span>
                  <div className="text-xl font-bold font-mono text-slate-700">
                    {currentRole === 'viewer' ? '-' : `${suspenseList.filter(s => s.reason === 'UNKNOWN_SENDER').length} 건`}
                  </div>
                </div>
              </div>

              {/* 가수금 테이블 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      미확인 가수금(보관함) 관리 목록
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      자동 매칭이 중단된 예외 건들을 검토하고 적합한 회계 조치를 수행합니다.
                    </p>
                  </div>

                  {/* 사유별 필터 칩 */}
                  <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-slate-200 p-1 rounded-xl text-xs">
                    <button
                      onClick={() => setSuspenseFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        suspenseFilter === 'ALL' ? 'bg-[#1E40AF] text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      전체 ({suspenseList.length})
                    </button>
                    <button
                      onClick={() => setSuspenseFilter('DUPLICATE_CANDIDATES')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        suspenseFilter === 'DUPLICATE_CANDIDATES' ? 'bg-[#1E40AF] text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      동명 충돌 ({suspenseList.filter(s => s.reason === 'DUPLICATE_CANDIDATES').length})
                    </button>
                    <button
                      onClick={() => setSuspenseFilter('UNMATCHED_AMOUNT')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        suspenseFilter === 'UNMATCHED_AMOUNT' ? 'bg-[#1E40AF] text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      차액 불일치
                    </button>
                    <button
                      onClick={() => setSuspenseFilter('UNKNOWN_SENDER')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        suspenseFilter === 'UNKNOWN_SENDER' ? 'bg-[#1E40AF] text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      미등록
                    </button>
                  </div>
                </div>

                {currentRole === 'viewer' ? (
                  <div className="p-16 text-center text-slate-400">
                    <Lock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-[#0F172A] text-sm">데이터 접근이 제한되었습니다</p>
                    <p className="text-xs text-slate-400 mt-1">상단 스위처에서 <strong>Admin (자금팀)</strong> 또는 <strong>Executive (CFO)</strong>로 전환해 보세요.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3.5">입금자명 (통장 적요)</th>
                          <th className="px-6 py-3.5 text-right">보류 금액</th>
                          <th className="px-6 py-3.5">보류 사유 및 시스템 감지</th>
                          <th className="px-6 py-3.5">상태</th>
                          <th className="px-6 py-3.5 text-center">예외 처리 액션</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {suspenseList
                          .filter(s => {
                            if (suspenseFilter === 'ALL') return true;
                            if (suspenseFilter === 'DUPLICATE_CANDIDATES') return s.reason === 'DUPLICATE_CANDIDATES';
                            if (suspenseFilter === 'UNMATCHED_AMOUNT') return s.reason.includes('UNMATCHED');
                            if (suspenseFilter === 'UNKNOWN_SENDER') return s.reason === 'UNKNOWN_SENDER';
                            return true;
                          })
                          .map((item) => {
                            const isConflict = item.reason === 'DUPLICATE_CANDIDATES';
                            const isUnmatched = item.reason.includes('UNMATCHED');

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/80 transition">
                                <td className="px-6 py-4 font-bold text-[#0F172A] text-sm">
                                  {item.sender_name}
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-[#1E40AF] text-sm">
                                  ₩ {Number(item.amount || 0).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  {isConflict ? (
                                    <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                      동명 대표자 / 동일 금액 충돌 ({item.conflict_count}건 존재)
                                    </span>
                                  ) : isUnmatched ? (
                                    <span className="text-rose-600 font-medium">
                                      정산 엑셀 대비 지급액 미달 차액
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">거래처 마스터 미등록 적요</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
                                    {item.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {isConflict && currentRole === 'admin' ? (
                                    <button
                                      onClick={() => setConflictModalItem(item)}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs hover:shadow-md transition active:scale-[0.98]"
                                    >
                                      ⚠️ 동일 명의 거래처 {item.conflict_count}건 존재 [조회 및 수동 연결]
                                    </button>
                                  ) : isUnmatched && currentRole === 'admin' ? (
                                    <button
                                      onClick={() => handleResolveDiffItem(item)}
                                      className="px-3.5 py-1.5 rounded-xl bg-[#1E40AF] hover:bg-blue-800 text-white font-bold text-xs shadow-2xs transition"
                                    >
                                      차액 정산 승인
                                    </button>
                                  ) : isConflict && currentRole === 'executive' ? (
                                    <span className="text-xs text-slate-400 italic">경영진 조회 전용</span>
                                  ) : (
                                    <span className="text-xs text-slate-400">검토 대기</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 내부통제 감사 로그(Audit Trail) 테이블 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1E40AF]" />
                    <h3 className="font-bold text-sm text-[#0F172A]">내부통제 감사 기록 (Audit Trail)</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">영구 보존 로그 ({auditLogs.length}건)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3">처리 시각</th>
                        <th className="px-5 py-3">작업 유형</th>
                        <th className="px-5 py-3">대상 키</th>
                        <th className="px-5 py-3">처리자</th>
                        <th className="px-5 py-3">상세 사유 및 메모</th>
                        <th className="px-5 py-3 text-right">금액</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80">
                          <td className="px-5 py-3 text-slate-400 font-mono">{log.created_at}</td>
                          <td className="px-5 py-3 font-semibold text-[#1E40AF]">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-[10px]">
                              {log.action_type}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono text-slate-700">{log.target_id}</td>
                          <td className="px-5 py-3 text-slate-600">{log.actor_email}</td>
                          <td className="px-5 py-3 text-slate-600">{log.memo}</td>
                          <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">
                            {log.amount > 0 ? `₩ ${Number(log.amount).toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* 5.1. 전사 거래처 & 채널 마스터 (다채널 맵핑 관리)              */
            /* ============================================================== */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#1E40AF]" />
                      거래처 & 판매 채널 관리
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      B2B 세금계산서 거래처부터 오픈마켓(네이버/쿠팡), 자사몰 PG사까지 모든 채널의 정산 정보와 대표자명을 통합 맵핑합니다.
                    </p>
                  </div>

                  <button
                    disabled={currentRole === 'viewer'}
                    onClick={() => setShowNewPartnerModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 active:scale-[0.98]"
                  >
                    <span>+ 신규 거래처 & 판매 채널 등록</span>
                  </button>
                </div>

                <div className="overflow-x-auto mt-5">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">법인 / 거래처 / 플랫폼명</th>
                        <th className="px-5 py-3.5">채널 유형 (Channel)</th>
                        <th className="px-5 py-3.5">대표자명 / 정산 식별자 (적요 매칭 키)</th>
                        <th className="px-5 py-3.5">사업자등록번호</th>
                        <th className="px-5 py-3.5 text-right">미수금 / 정산 잔액</th>
                        <th className="px-5 py-3.5 text-center">정산 대조 상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partnersList
                        .filter(p => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            p.company_name.toLowerCase().includes(q) ||
                            p.ceo_name.toLowerCase().includes(q) ||
                            (p.business_number && p.business_number.includes(q)) ||
                            p.channel_type.toLowerCase().includes(q)
                          );
                        })
                        .map((p) => {
                          const getChannelBadge = (ch: string) => {
                            switch (ch) {
                              case 'B2B':
                                return <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#1E40AF] font-bold text-[11px] border border-blue-200">B2B</span>;
                              case 'SMARTSTORE':
                                return <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">스마트스토어</span>;
                              case 'COUPANG':
                                return <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 font-bold text-[11px] border border-orange-200">쿠팡 로켓</span>;
                              case 'OWN_MALL':
                                return <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">자사몰 PG</span>;
                              default:
                                return <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">{ch}</span>;
                            }
                          };

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition">
                              <td className="px-5 py-4 font-bold text-[#0F172A] text-sm">
                                {p.company_name}
                              </td>
                              <td className="px-5 py-4">
                                {getChannelBadge(p.channel_type)}
                              </td>
                              <td className="px-5 py-4">
                                <span className="font-bold text-[#1E40AF] bg-blue-50/80 px-2 py-1 rounded-md border border-blue-100">
                                  {p.ceo_name}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-mono text-slate-500">{p.business_number}</td>
                              <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">
                                ₩ {Number(p.uncollected || 0).toLocaleString()}
                              </td>
                              <td className="px-5 py-4 text-center">
                                {p.alias_active ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <Check className="w-3 h-3" />
                                    교차 매칭 활성
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">2-Step 덩어리 대조</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* 6. 모달 1: 드릴다운 원천 거래 상세 내역 (Light Card Style)     */}
      {/* ============================================================== */}
      {drillDownItem && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1E40AF]">
                  <PieIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  [{drillDownItem.category}] 원천 거래 상세 내역
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1E40AF] font-bold text-[11px] border border-blue-200">
                  {channelFilter === 'ALL' ? '전체 채널' : `${channelFilter} 채널`}
                </span>
              </div>
              <button
                onClick={() => setDrillDownItem(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3 mb-4">
              현재 선택된 <strong className="text-slate-700">[{channelFilter === 'ALL' ? '전체' : channelFilter}]</strong> 채널 기준의 실제 주문 원장 및 공제 상세 내역입니다.
            </p>

            <div className="overflow-x-auto max-h-72 border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-slate-500 font-bold sticky top-0 border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5 whitespace-nowrap">주문번호</th>
                    <th className="px-4 py-2.5 whitespace-nowrap">채널 / 거래처</th>
                    <th className="px-4 py-2.5 text-right whitespace-nowrap">차감 손실액</th>
                    <th className="px-4 py-2.5 whitespace-nowrap">공제 상세 사유</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drillDownItem.records.length > 0 ? (
                    drillDownItem.records.map((r) => {
                      const channel = getRiskChannel(r.order_key);
                      const sales = salesRecords.find(s => s.order_key === r.order_key);
                      const partnerName = sales?.business_partners?.company_name || '-';
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-mono font-bold text-[#1E40AF] whitespace-nowrap">{r.order_key}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 text-xs block">{partnerName}</span>
                            <span className="text-[10px] text-slate-400 block font-medium">{channel}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-rose-600 whitespace-nowrap">
                            ₩ {Number(r.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-medium">{r.description}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        현재 선택된 [{channelFilter}] 채널에는 [{drillDownItem.category}] 차감 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setDrillDownItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. 모달 2: 동명/동일 금액 중복 충돌 수동 분개 모달 (PRD 5.2)    */}
      {/* ============================================================== */}
      {conflictModalItem && (
        <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  ⚠️ 동일 명의 거래처 중복 충돌 수동 분개
                </h3>
              </div>
              <button
                onClick={() => setConflictModalItem(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              통장 적요 <strong>'{conflictModalItem.sender_name}'</strong> 명의로 입금된 <strong>₩ {Number(conflictModalItem.amount || 0).toLocaleString()}</strong>에 대해 
              동일 대표자명 및 동일 청구액을 가진 거래처가 2건 발견되어 자동 매칭이 중단되었습니다.
            </div>

            <div className="mt-5 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                상계 처리할 거래처를 육안 검토 후 선택해 주세요:
              </label>

              {/* 후보 1: (주)베타로지스 */}
              <label 
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  selectedCandidate === 'beta' 
                    ? 'border-[#1E40AF] bg-blue-50/50 ring-2 ring-[#1E40AF]/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <input
                    type="radio"
                    name="candidate"
                    value="beta"
                    checked={selectedCandidate === 'beta'}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="w-4 h-4 text-[#1E40AF] focus:ring-[#1E40AF]"
                  />
                  <div>
                    <span className="font-bold text-sm text-[#0F172A] block">(주)베타로지스</span>
                    <span className="text-xs text-slate-500">대표자: 김철수 | 사업자번호: 214-82-67890</span>
                    <span className="text-xs text-[#1E40AF] font-semibold block mt-0.5">
                      최근 미수금 청구액: ₩ 5,000,000 (세금계산서 INV-20260901-004)
                    </span>
                  </div>
                </div>
              </label>

              {/* 후보 2: (주)감마글로벌 */}
              <label 
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  selectedCandidate === 'gamma' 
                    ? 'border-[#1E40AF] bg-blue-50/50 ring-2 ring-[#1E40AF]/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <input
                    type="radio"
                    name="candidate"
                    value="gamma"
                    checked={selectedCandidate === 'gamma'}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="w-4 h-4 text-[#1E40AF] focus:ring-[#1E40AF]"
                  />
                  <div>
                    <span className="font-bold text-sm text-[#0F172A] block">(주)감마글로벌</span>
                    <span className="text-xs text-slate-500">대표자: 김철수 | 사업자번호: 305-86-54321</span>
                    <span className="text-xs text-[#1E40AF] font-semibold block mt-0.5">
                      최근 미수금 청구액: ₩ 5,000,000 (세금계산서 INV-20260905-005)
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* 관리자 승인 메모 입력 (감사 로그 저장용) */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                관리자 확인 메모 (감사 기록용):
              </label>
              <input
                type="text"
                value={adminMemo}
                onChange={(e) => setAdminMemo(e.target.value)}
                placeholder="예: 영업팀 유선 대조 완료 (계좌 일치)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConflictModalItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                취소
              </button>
              <button
                disabled={!selectedCandidate}
                onClick={handleResolveConflict}
                className="px-5 py-2.5 bg-[#1E40AF] hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-blue-900/20 transition active:scale-[0.98]"
              >
                선택 거래처로 수동 연결 확정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. 모달 3: 신규 거래처/채널 및 대표자 맵핑 추가 모달 (PRD 5.1)  */}
      {/* ============================================================== */}
      {showNewPartnerModal && (
        <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1E40AF]" />
                신규 거래처 / 판매 채널 및 대표자 맵핑 등록
              </h3>
              <button
                onClick={() => setShowNewPartnerModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewPartner} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  법인 / 거래처 / 플랫폼 상호명 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: (주)델타네트웍스 또는 11번가"
                  value={newPartnerForm.company_name}
                  onChange={(e) => setNewPartnerForm(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  채널 유형 (Channel Type) *
                </label>
                <select
                  value={newPartnerForm.channel_type}
                  onChange={(e) => setNewPartnerForm(prev => ({ ...prev, channel_type: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 font-medium cursor-pointer"
                >
                  <option value="B2B">B2B (세금계산서)</option>
                  <option value="SMARTSTORE">SMARTSTORE (네이버 스마트스토어)</option>
                  <option value="COUPANG">COUPANG (쿠팡 로켓배송 / 윙)</option>
                  <option value="OWN_MALL">OWN_MALL (자사몰 / PG 정산사)</option>
                  <option value="OPEN_MARKET">OPEN_MARKET (11번가 / G마켓 등 오픈마켓)</option>
                  <option value="OFFLINE">OFFLINE (오프라인 매장 / 직영점)</option>
                </select>
                <span className="text-[11px] text-slate-400 block mt-1">
                  💡 B2B는 적요 교차 매칭 키로 연동되며, 오픈마켓/자사몰은 2-Step 덩어리 대조 배치로 연동됩니다.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  대표자 개인명 / 정산 식별자 (통장 적요 매칭 키) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 이영희 (B2B 대표자 개인명 또는 플랫폼명)"
                  value={newPartnerForm.ceo_name}
                  onChange={(e) => setNewPartnerForm(prev => ({ ...prev, ceo_name: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  💡 통장 적요란에 이 이름이 찍혀 입금되면 시스템이 해당 거래처로 자동 매칭합니다.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  사업자등록번호
                </label>
                <input
                  type="text"
                  placeholder="예: 410-85-98765"
                  value={newPartnerForm.business_number}
                  onChange={(e) => setNewPartnerForm(prev => ({ ...prev, business_number: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewPartnerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E40AF] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  등록 및 맵핑 활성화
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================== */}
      {/* 8. 모달 3: 업로드 파일 파싱 데이터 미리보기 모달                 */}
      {/* ============================================================== */}
      {filePreviewType && (
        <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1E40AF]">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    {filePreviewType === 'bank' ? '[은행 통장 입금 원장] 파싱 데이터 미리보기' : '[플랫폼 정산 원장] 파싱 데이터 미리보기'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {filePreviewType === 'bank' && uploadedBankFile 
                      ? `${uploadedBankFile.name} (${uploadedBankFile.rows.length}건, 실입금 ₩ ${uploadedBankFile.totalAmount.toLocaleString()})`
                      : uploadedSettlementFile 
                      ? `${uploadedSettlementFile.name} (${uploadedSettlementFile.rows.length}개 주문, 실지급 ₩ ${uploadedSettlementFile.totalSettled.toLocaleString()})`
                      : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilePreviewType(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto max-h-96 border border-slate-100 rounded-xl my-4">
              {filePreviewType === 'bank' && uploadedBankFile ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-200 sticky top-0 text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5 whitespace-nowrap">#</th>
                      <th className="px-4 py-2.5 whitespace-nowrap">거래일시</th>
                      <th className="px-4 py-2.5 whitespace-nowrap">적요 / 입금자명</th>
                      <th className="px-4 py-2.5 whitespace-nowrap">계좌번호</th>
                      <th className="px-4 py-2.5 text-right whitespace-nowrap">실입금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {uploadedBankFile.rows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-400 font-mono text-[10px]">{i + 1}</td>
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-800 whitespace-nowrap">{r.sender}</td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono whitespace-nowrap">{r.account}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-[#1E40AF] whitespace-nowrap">
                          ₩ {r.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filePreviewType === 'settlement' && uploadedSettlementFile ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-200 sticky top-0 text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5 whitespace-nowrap">주문번호</th>
                      <th className="px-4 py-2.5 whitespace-nowrap">플랫폼</th>
                      <th className="px-4 py-2.5 whitespace-nowrap">주문일자</th>
                      <th className="px-4 py-2.5 text-right whitespace-nowrap">결제금액</th>
                      <th className="px-4 py-2.5 text-right whitespace-nowrap">정산실지급액</th>
                      <th className="px-4 py-2.5 text-right whitespace-nowrap">수수료(FEE)</th>
                      <th className="px-4 py-2.5 text-right whitespace-nowrap">반품(RETURN)</th>
                      <th className="px-4 py-2.5 text-right whitespace-nowrap">파손(DAMAGE)</th>
                      <th className="px-4 py-2.5 text-right whitespace-nowrap">기타(ETC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {uploadedSettlementFile.rows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-[#1E40AF] whitespace-nowrap">{r.orderKey}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">{r.platform}</td>
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-900 whitespace-nowrap">
                          ₩ {r.grossAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                          ₩ {r.settledAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-[#1E40AF] whitespace-nowrap">
                          {r.fee > 0 ? `₩ ${r.fee.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-rose-600 whitespace-nowrap">
                          {r.returnLoss > 0 ? `₩ ${r.returnLoss.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-sky-600 whitespace-nowrap">
                          {r.damage > 0 ? `₩ ${r.damage.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-500 whitespace-nowrap">
                          {r.etc > 0 ? `₩ ${r.etc.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setFilePreviewType(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
