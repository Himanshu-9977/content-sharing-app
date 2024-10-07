// ... (previous imports)
import { Pagination } from '@/components/Pagination';

export default function Groups() {
  // ... (previous state)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ... (previous useEffect and functions)

  const fetchGroupMembers = async (groupId: string, page: number = 1) => {
    try {
      const response = await teams.listMemberships(
        groupId,
        [
          Query.limit(ITEMS_PER_PAGE),
          Query.offset((page - 1) * ITEMS_PER_PAGE)
        ]
      );
      setGroupMembers(response.memberships as GroupMember[]);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      setCurrentPage(page);
    } catch (error) {
      console.error('Fetch group members error:', error);
      toast({
        title: "Error fetching group members",
        description: "An error occurred while fetching group members. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup.$id, page);
    }
  };

  // ... (rest of the component)

  return (
    <div className="min-h-screen bg-background">
      {/* ... (previous JSX) */}
      {selectedGroup && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Group Members: {selectedGroup.name}</h2>
          {/* ... (group members mapping) */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}