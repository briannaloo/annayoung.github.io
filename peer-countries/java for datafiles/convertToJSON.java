import java.io.*;
import java.util.*;

public class convertToJSON
{
	public static void main(String[] args) throws IOException 
	{
		String file = "original data/peer data rotated.csv";
		Scanner scan = new Scanner(new File(file));
		String header = scan.nextLine();
		String[] countries = header.split(",");
		int num_columns = countries.length - 1;
		int num_regions = 8;

		// map countries to regions
		HashMap<String, String> regions = new HashMap<String, String>();
		String regions_file = "original data/Materiality_2014.csv";
		map(regions, regions_file);

		// load names & indices
		String[] region_names = {
			"North America", 
			"Europe",
			"Eastern Europe and Central Asia", 
			"South Asia",
			"East Asia and the Pacific",
			"Sub-Saharan Africa", 
			"Middle East and North Africa",
			"Latin America and Caribbean"};
		String[] names = new String[num_columns + num_regions];
		int[] region_indices = new int[num_regions];
		HashMap<String, String> country_indices = new HashMap<String, String>();
		int names_length = 
		loadNames(region_names, names, region_indices, country_indices,
				countries, regions, num_columns);

		// load countries
		int[][] matrix = new int[names_length][names_length];
		int[][] mutual_matrix = new int[names_length][names_length];
		int[][] rejected_matrix = new int[names_length][names_length];
		loadCountries(matrix, mutual_matrix, rejected_matrix, 
			country_indices, region_indices, countries, regions, scan, 
			region_names, names_length);

		/*PrintWriter regionCountries = new PrintWriter("updated data/Peers.json", "UTF-8");
		printData(regionCountries, names, region_indices, matrix, names_length, "2012");
		PrintWriter mutualData = new PrintWriter("updated data/MutualPeers.json", "UTF-8");
		printData(mutualData, names, region_indices, mutual_matrix, names_length, "Mutual Peers");

		PrintWriter countriesCSV = new PrintWriter("updated data/Peers2.csv", "UTF-8");
		printCSV(countriesCSV, names, region_indices, matrix, names_length, names);
		PrintWriter mutualCSV = new PrintWriter("updated data/MutualPeers.csv", "UTF-8");
		printCSV(mutualCSV, names, region_indices, mutual_matrix, names_length, names);
		*/

		//PrintWriter rejectedCSV = new PrintWriter("updated data/rejected.csv", "UTF-8");
		//printCSV(rejectedCSV, names, region_indices, rejected_matrix, names_length, names);

		PrintWriter mutualData = new PrintWriter("updated data/MutualPeers.json", "UTF-8");
		printCombined(mutualData, names, region_indices, matrix, mutual_matrix, rejected_matrix, names_length, 
			"All Peers", "Mutual Peers", "Unreciprocated Peers");

	}

	public static void printCombined (PrintWriter json, String[] names, int[] region_indices, int[][] matrix, int[][] mutual_matrix, int[][] rejected_matrix, int length, String label1, String label2, String label3) throws IOException 
	{
		json.print("{\"names\":[");
		for (int i = 0; i < names.length; i++)
		{
			if (i!=0)
				json.print(",");
			json.print("\"" + names[i]);
			if (!hasData(matrix, i, names.length))
			{
				json.print("*");
			}
			json.print("\"");
		}
		json.print("],");
  
		json.print("\"regions\":[");
		for (int i = 0; i < region_indices.length; i++)
		{
			if (i != 0)
				json.print(",");
			json.print(region_indices[i]);
		}
		json.print("],");

		json.print("\"matrix\":{");

		// print "2012" matrix
		json.print("\"" + label1 + "\":[");
		for (int i = 0; i < length; i++)
		{
			json.print("[");
			for (int j = 0; j < length; j++)
			{
				if (j > 0)
					json.print(",");
				json.print(matrix[i][j]);
			}
			json.print("]");
			if (i != length-1)
				json.print(",");
		}
		json.print("],");

		// print "Mutual" matrix
		json.print("\"" + label2 + "\":[");
		for (int i = 0; i < length; i++)
		{
			json.print("[");
			for (int j = 0; j < length; j++)
			{
				if (j > 0)
					json.print(",");
				json.print(mutual_matrix[i][j]);
			}
			json.print("]");
			if (i != length-1)
				json.print(",");
		}
		json.print("],");

		// print "Unreciprocated" matrix
		json.print("\"" + label3+ "\":[");
		for (int i = 0; i < length; i++)
		{
			json.print("[");
			for (int j = 0; j < length; j++)
			{
				if (j > 0)
					json.print(",");
				json.print(rejected_matrix[i][j]);
			}
			json.print("]");
			if (i != length-1)
				json.print(",");
		}
		json.print("]");


		json.print("}}");
		json.flush();
		json.close();
	}


	public static void loadCountries (int[][] matrix, int[][] mutual_matrix, int[][] rejected_matrix, HashMap<String, String> country_indices, 
		int[] region_indices, String[] countries, HashMap<String, String> regions, 
		Scanner scan, String[] region_names, int length)
	{
		//initialize
		for (int i = 0; i < length; i++)
		{
			for (int j = 0; j < length; j++)
			{
				matrix[i][j] = 0;
				mutual_matrix[i][j] = 0;
				rejected_matrix[i][j] = 0;
			}
		}

		// load country data
		while (scan.hasNextLine())						// for each country (data point)				
		{
			String line = scan.nextLine();	
			String peers[] = line.split(",");			// asked about these countries
			String country = peers[0];

			int origin = Integer.parseInt(country_indices.get(country));
			for (int i = 1; i < peers.length; i++)
			{
				if (peers[i].equals("1"))
				{
					int destination = Integer.parseInt(country_indices.get(countries[i]));
					if (origin != destination)	// so no self-mutual relationships
						matrix[origin][destination] = 1;
				}
			}
		}


		// only mutual relationships (separate matrix)
		for (int i = 0; i < length; i++)
		{
			for (int j = 0; j < length; j++)
			{
				if (matrix[i][j] == 1 && matrix[j][i] == 1
					&& mutual_matrix[j][i] != 1 // only one of them is taken as 1 (so no duplicates)
					&& i != j)	// so no self-mutual relationships
					mutual_matrix[i][j] = 1;	
			}
		}

		// rejected peer (separate matrix)
		for (int i = 0; i < length; i++)
		{
			for (int j = 0; j < length; j++)
			{
				if (matrix[i][j] == 1 && matrix[j][i] == 0	
					&& hasData(matrix, j, length))
					rejected_matrix[i][j] = 1;	
			}
		}


		// once loaded all of that country's data and duplicates are combined
			// load the data for that country->regions
		for (int ctry = 1; ctry < countries.length; ctry++)
		{
			String country = countries[ctry];
			int origin = Integer.parseInt(country_indices.get(country));

			int num_regions = region_indices.length;
			for (int rgn = 0; rgn < num_regions; rgn++)
			{
				int index = region_indices[rgn];
				int next_index = length;
				if (rgn != num_regions-1)
					next_index = region_indices[rgn+1];

				for (int i = index+1; i < next_index; i++)
				{
					matrix[origin][index] += matrix[origin][i];
					mutual_matrix[origin][index] += mutual_matrix[origin][i];
					rejected_matrix[origin][index] += rejected_matrix[origin][i];
				}	
			}
		}

		// load region->countries/region data
		int num_regions = region_indices.length;
		for (int rgn = 0; rgn < num_regions; rgn++)
		{
			int index = region_indices[rgn];
			int next_index = length;
			if (rgn != num_regions-1)
				next_index = region_indices[rgn+1];

			for (int i = 0; i < length; i++)	// for each possible peer
			{
				int count = 0, mutual_count = 0, rejected_count = 0;
				for (int ctry = index+1; ctry < next_index; ctry++)	// for each country in that region
				{
					count += matrix[ctry][i];
					mutual_count += mutual_matrix[ctry][i];
					rejected_count += rejected_matrix[ctry][i];
				}
				matrix[index][i] = count;
				mutual_matrix[index][i] = mutual_count;
				rejected_matrix[index][i] = rejected_count;
			}
		}
	}

	public static int getRegionIndex(String region, String[] region_names, int[] region_indices)
	{
		for (int i = 0; i < region_names.length; i++)
		{
			if (region_names[i].equals(region))
				return region_indices[i];
		}
		return 0;
	}

	public static boolean hasData (int[][] matrix, int index, int length)
	{
		for (int i = 0; i < length; i++)
		{
			if (matrix[index][i] != 0)
				return true;
		}
		return false;
	}

	public static int loadNames (String[] region_names, String[] names, int[] region_indices, HashMap<String, String> country_indices, 
							String[] countries, HashMap<String, String> regions, int num_columns)
	{		
		int index = 0;
		for (int rgn = 0; rgn < region_names.length; rgn++)
		{
			names[index] = region_names[rgn];
			region_indices[rgn] = index;
			index++;
			for (int i = 1; i <= num_columns; i++)
			{
				if (regions.get(countries[i]).equals(region_names[rgn]))
				{
					names[index] = countries[i];
					country_indices.put(countries[i],  Integer.toString(index));
					index++;
				}
			}
		}
		return names.length;
	}

	public static void map (HashMap<String, String> regions, String regions_file) throws IOException 
	{
		Scanner r = new Scanner(new File(regions_file));
		r.nextLine();	// ignore header
		while (r.hasNextLine())		// map all countries to appropriate region
		{
			String line = r.nextLine();
			String[] split = line.split(",");
			regions.put(split[2], split[3]);
		}
	}

	public static void printData (PrintWriter json, String[] names, int[] region_indices, int[][] matrix, int length, String label) throws IOException 
	{
		json.print("{\"names\":[");
		for (int i = 0; i < names.length; i++)
		{
			if (i!=0)
				json.print(",");
			json.print("\"" + names[i] + "\"");
		}
		json.print("],");
  
		json.print("\"regions\":[");
		for (int i = 0; i < region_indices.length; i++)
		{
			if (i != 0)
				json.print(",");
			json.print(region_indices[i]);
		}
		json.print("],");

		json.print("\"matrix\":{\"" + label + "\":[");
		for (int i = 0; i < length; i++)
		{
			json.print("[");
			for (int j = 0; j < length; j++)
			{
				if (j > 0)
					json.print(",");
				json.print(matrix[i][j]);
			}
			json.print("]");
			if (i != length-1)
				json.print(",");
		}
		json.print("]}");
		json.print("}");
		json.flush();
		json.close();
	}


	public static void printCSV (PrintWriter csv, String[] names, int[] region_indices, int[][] matrix, int length, String[] countries) throws IOException 
	{
		csv.print("names");
		for (int i = 0; i < names.length; i++)
		{
			csv.print("," + names[i]);
		}
		csv.println();

		for (int i = 0; i < length; i++)
		{
			csv.print(names[i]);
			for (int j = 0; j < length; j++)
			{
				csv.print("," + matrix[i][j]);
			}
			csv.println();
		}
		csv.println();
		csv.flush();
		csv.close();
	}
}